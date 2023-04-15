import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameGateway } from './gateways/game.gateway';
import { Player, PlayerSchema } from './schemas/player.schema';
import { GameService } from './services/game.service';
import { PlayerService } from './services/player.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://0.0.0.0:27017/typeracer'),
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, GameGateway, PlayerService, GameService],
})
export class AppModule {}
