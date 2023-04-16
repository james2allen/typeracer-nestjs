import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesGateway } from './games/games.gateway';
import { Player, PlayerSchema } from './players/player.schema';
import { GamesService } from './games/games.service';
import { PlayerService } from './players/player.service';
import { QuotableService } from './quotable/quotable.service';
import { Game, GameSchema } from './games/game.schema';
import { GamesModule } from './games/games.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://0.0.0.0:27017/typeracer'),
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    GamesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PlayerService, QuotableService],
})
export class AppModule {}
