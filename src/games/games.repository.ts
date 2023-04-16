import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Game } from './game.schema';

@Injectable()
export class GamesRepository {
  constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

  async findOne(gameFilterQuery: FilterQuery<Game>): Promise<Game> {
    return this.gameModel.findOne(gameFilterQuery);
  }

  async create(game: Game): Promise<Game> {
    const newGame = new this.gameModel(game);
    return newGame.save();
  }

  async findOneAndUpdate(
    gameFilterQuery: FilterQuery<Game>,
    game: Partial<Game>,
  ): Promise<Game> {
    return this.gameModel.findOneAndUpdate(gameFilterQuery, game);
  }
}
