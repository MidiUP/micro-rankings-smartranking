import { ackMessage, ackMessageError } from './../common/utils/ackMessages';
import { RankingsService } from './rankings.service';
import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Match } from './interfaces/match.interface';
import { RankingResponse } from './interfaces/ranking-response.interface';

const ackErrors: string[] = ['E11000'];

@Controller()
export class RankingsController {
  private readonly logger = new Logger(RankingsController.name);

  constructor(private readonly rankingsService: RankingsService) {}

  @EventPattern('process-match')
  async processMatch(@Payload() match: Match, @Ctx() context: RmqContext) {
    try {
      await this.rankingsService.processMatch(match);
      await ackMessage(context);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      await ackMessageError(ackErrors, error, context);
    }
  }

  @MessagePattern('get-ranking-by-category')
  async getRankingByCategory(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<RankingResponse[] | RankingResponse> {
    try {
      const { idCategory, dataRef } = data;
      return await this.rankingsService.getRankingByCategory(
        idCategory,
        dataRef,
      );
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
    } finally {
      await ackMessage(context);
    }
  }
}
