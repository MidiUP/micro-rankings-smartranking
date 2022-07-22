import { Module } from '@nestjs/common';
import { RankingsModule } from './rankings/rankings.module';
import 'dotenv/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMqModule } from './rabbit-mq/rabbit-mq.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URL),
    RankingsModule,
    RabbitMqModule,
    RabbitMqModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
