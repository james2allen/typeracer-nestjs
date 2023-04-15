import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from '../schemas/game.schema';

@Injectable()
export class GameService {
  constructor(@InjectModel(Game.name) private gameModel: Model<GameDocument>) {}

  async create(game: Game): Promise<Game> {
    const newGame = new this.gameModel(game);
    return newGame.save();
  }

  async readAll(): Promise<Game[]> {
    return await this.gameModel.find().exec();
  }

  async readById(id): Promise<Game> {
    return await this.gameModel.findById(id).exec();
  }

  async update(id, player: Game): Promise<Game> {
    return await this.gameModel.findByIdAndUpdate(id, player, {
      new: true,
    });
  }

  async delete(id): Promise<any> {
    return await this.gameModel.findByIdAndRemove(id);
  }
}
