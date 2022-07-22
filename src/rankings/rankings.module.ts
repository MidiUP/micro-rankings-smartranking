import { RankingSchema } from './interfaces/ranking.schema';
import { Module } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { RankingsController } from './rankings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMqModule } from 'src/rabbit-mq/rabbit-mq.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Ranking', schema: RankingSchema }]),
    RabbitMqModule,
  ],
  providers: [RankingsService],
  controllers: [RankingsController],
})
export class RankingsModule {}
