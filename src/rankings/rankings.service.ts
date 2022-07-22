import { ClientProxyConnections } from './../rabbit-mq/client-proxy-connections';
import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match } from './interfaces/match.interface';
import { Ranking } from './interfaces/ranking.schema';
import { firstValueFrom } from 'rxjs';
import { Category } from './interfaces/category.interface';
import { EventName } from './enums/event-name.enum';
import { RankingResponse } from './interfaces/ranking-response.interface';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';
import { Challenge } from './interfaces/challenge.interface';

@Injectable()
export class RankingsService {
  private readonly logger = new Logger(RankingsService.name);
  private readonly clientAdminBackend: ClientProxy;
  private readonly clientChallengeBackend: ClientProxy;

  constructor(
    @InjectModel('Ranking') private readonly rankingModel: Model<Ranking>,
    private readonly clientProxyConnections: ClientProxyConnections,
  ) {
    this.clientAdminBackend = this.clientProxyConnections.connectQueueAdmin();
    this.clientChallengeBackend =
      this.clientProxyConnections.connectQueueChallenge();
  }

  async processMatch(match: Match): Promise<void> {
    try {
      const { players } = match;

      const category: Category = await firstValueFrom(
        this.clientAdminBackend.send('get-category-by-id', match.category),
      );

      const eventVictory = category.events.find(
        (event) => event.name === EventName.VICTORY,
      );
      const eventDefeat = category.events.find(
        (event) => event.name === EventName.DEFEAT,
      );

      for (const player of players) {
        const ranking = {
          category: match.category,
          challenge: match.challenge,
          match: match._id,
          player,
          operation:
            player === match.def
              ? eventVictory.operation
              : eventDefeat.operation,
          event: player === match.def ? eventVictory.name : eventDefeat.name,
          points: player === match.def ? eventVictory.value : eventDefeat.value,
        };

        await new this.rankingModel(ranking).save();
      }
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getRankingByCategory(
    idCategory: string,
    dataRef: any,
  ): Promise<RankingResponse[] | RankingResponse> {
    try {
      if (!dataRef) {
        dataRef = moment().tz('America/Sao_paulo').format('YYYY-MM-DD');
      }

      const dataRanking: Ranking[] = await this.rankingModel
        .find()
        .where('category')
        .equals(idCategory)
        .exec();

      const challenges: Challenge[] = await firstValueFrom(
        this.clientChallengeBackend.send('get-challenges-completed-by-date', {
          idCategory,
          dataRef,
        }),
      );

      _.remove(dataRanking, (item) => {
        return !challenges.some((challenge) => challenge._id == item.challenge);
      });

      const rankingsByPlayer = _(dataRanking)
        .groupBy('player')
        .map((items, key) => ({
          player: key,
          history: _.countBy(items, 'event'),
          points: _.sumBy(items, 'points'),
        }))
        .value();

      const rankingSorted = _.orderBy(rankingsByPlayer, 'points', 'desc');

      const rankingResponse: RankingResponse[] = rankingSorted.map(
        (item, index) => ({
          player: item.player,
          position: index + 1,
          score: item.points,
          historyMatchs: {
            victories: item.history.VICTORY ? item.history.VICTORY : 0,
            defeats: item.history.DEFEAT ? item.history.DEFEAT : 0,
          },
        }),
      );

      return rankingResponse;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
