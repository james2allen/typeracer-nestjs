import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PlayerService } from 'src/services/player.service';
import { GameService } from 'src/services/game.service';
import { QuotableService } from 'src/services/quotable.service';
import { Game } from 'src/schemas/game.schema';
import { Player } from 'src/schemas/player.schema';

const QuotableAPI = require('./QuotableAPI');

interface TimerPayload {
  gameID: string;
  playerID: string;
}

interface JoinGamePayload {
  gameID: string;
  nickname: string;
}

@Injectable()
@WebSocketGateway(80, {
  cors: {
    origin: 'http://localhost:3000',
  },
})
export class GameGateway {
  constructor(
    private playerService: PlayerService,
    private gameService: GameService,
    private quotableService: QuotableService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('create-game')
  async createGame(client: Socket, nickname: string): Promise<void> {
    try {
      const quotableData = await this.quotableService.getQuote();
      let game = new Game();
      game.words = quotableData;
      let player = new Player({
        socketID: client.id,
        isPartyLeader: true,
        nickname,
      });
      game.players.push(player);
      game = await this.gameService.create(game);

      const gameID = game._id.toString();
      client.join(gameID);
      this.server.to(gameID).emit('update-game', game);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('timer')
  async startTimer(client: Socket, payload: TimerPayload): Promise<void> {
    let countDown = 5;
    let game = await this.gameService.readById(payload.gameID);
    let player = game.players.find((player) => player.id === payload.playerID);
    if (player.isPartyLeader) {
      let timerID = setInterval(async () => {
        if (countDown >= 0) {
          this.server
            .to(payload.gameID)
            .emit('timer', { countDown, msg: 'Starting Game' });
          countDown--;
        } else {
          game.isOpen = false;
          game = await game.save();
          this.server.to(payload.gameID).emit('update-game', game);
          this.startGameClock(payload.gameID);
          clearInterval(timerID);
        }
      }, 1000);
    }
  }

  @SubscribeMessage('join-game')
  async joinGame(client: Socket, payload: JoinGamePayload): Promise<void> {
    try {
      let game = await this.gameService.readById(payload.gameID);
      if (game.isOpen) {
        const gameID = game._id.toString();
        client.join(gameID);

        let player = new Player({
          socketID: client.id,
          nickName: payload.nickname,
        });

        game.players.push(player);
        game = await this.gameService.update(game._id, game);
        this.server.to(gameID).emit('update-game', game);
      }
    } catch (err) {
      console.log(err);
    }
  }

  private async startGameClock(gameID: string): Promise<void> {
    let game = await this.gameService.readById(gameID);
    game.startTime = new Date().getTime();
    game = await this.gameService.update(game._id, game);

    let time = 120;

    let timerID = setInterval(
      (function gameIntervalFunc() {
        const formatTime = this.calculateTime(time);
        if (time >= 0) {
          this.server.to(gameID).emit('timer', {
            countDown: formatTime,
            msg: 'Time Remaining',
          });
          time--;
        }
        return gameIntervalFunc;
      })(),
      1000,
    );
  }

  private calculateTime(time: number): string {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;

    return `${minutes}:${seconds > 9 ? seconds : `0${seconds}`}`;
  }
}
