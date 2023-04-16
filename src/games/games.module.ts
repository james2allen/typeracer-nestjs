import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { QuotableService } from 'src/quotable/quotable.service';
import { GamesGateway } from './games.gateway';
import { Game, GameSchema } from './game.schema';
import { GamesService } from './games.service';
import { GamesRepository } from './games.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    HttpModule,
  ],
  controllers: [],
  providers: [GamesGateway, GamesService, QuotableService, GamesRepository],
})
export class GamesModule {}
