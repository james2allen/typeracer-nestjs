import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PlayerService } from 'src/players/player.service';
import { GamesService } from 'src/games/games.service';
import { QuotableService } from 'src/quotable/quotable.service';
import { Player } from 'src/players/player.schema';

interface TimerPayload {
  gameID: string;
  playerID: string;
}

interface JoinGamePayload {
  gameID: string;
  nickname: string;
}

@Injectable()
@WebSocketGateway(3001, { cors: true })
export class GamesGateway {
  constructor(
    private gameService: GamesService,
    private quotableService: QuotableService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('create-game')
  async createGame(client: Socket, nickname: string): Promise<void> {
    try {
      const words = await this.quotableService.getQuote();
      console.log('here 1');
      let game = await this.gameService.createGame(words);

      let player = new Player({
        socketID: client.id,
        isPartyLeader: true,
        nickname,
      });
      game.players.push(player);

      game = await this.gameService.updateGame(game.id, game);

      const gameID = game.id;
      client.join(gameID);

      this.server.to(gameID).emit('update-game', game);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('timer')
  async startTimer(client: Socket, payload: TimerPayload): Promise<void> {
    let countDown = 5;
    let game = await this.gameService.getGameById(payload.gameID);
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
          game = await this.gameService.updateGame(game.id, game);
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
      let game = await this.gameService.getGameById(payload.gameID);
      if (game.isOpen) {
        const gameID = game.id;
        client.join(gameID);

        let player = new Player({
          socketID: client.id,
          nickName: payload.nickname,
        });

        game.players.push(player);
        game = await this.gameService.updateGame(game.id, game);
        this.server.to(gameID).emit('update-game', game);
      }
    } catch (err) {
      console.log(err);
    }
  }

  private async startGameClock(gameID: string): Promise<void> {
    let game = await this.gameService.getGameById(gameID);
    game.startTime = new Date().getTime();
    game = await this.gameService.updateGame(game.id, game);

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
