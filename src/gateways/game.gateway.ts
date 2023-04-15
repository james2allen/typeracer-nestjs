import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

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
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('create-game')
  async createGame(client: Socket, nickname: string): Promise<void> {
    try {
      const quotableData = await QuotableAPI();
      let game = new Game();
      game.words = quotableData;
      let player = {
        socketID: client.id,
        isPartyLeader: true,
        nickname,
      };
      game.players.push(player);
      game = await game.save();

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
    let game = await Game.findById(payload.gameID);
    let player = game.players.id(payload.playerID);
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
      let game = await Game.findById(payload.gameID);
      if (game.isOpen) {
        const gameID = game._id.toString();
        client.join(gameID);

        let player = {
          socketID: client.id,
          nickName: payload.nickname,
        };

        game.players.push(player);
        game = await game.save();
        this.server.to(gameID).emit('update-game', game);
      }
    } catch (err) {
      console.log(err);
    }
  }

  private async startGameClock(gameID: string): Promise<void> {
    let game = await Game.findById(gameID);
    game.startTime = new Date().getTime();
    game = await game.save();

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
