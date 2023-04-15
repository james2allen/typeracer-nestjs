import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from '../schemas/player.schema';

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
  ) {}

  async create(player: Player): Promise<Player> {
    const newPlayer = new this.playerModel(player);
    return newPlayer.save();
  }

  async readAll(): Promise<Player[]> {
    return await this.playerModel.find().exec();
  }

  async readById(id): Promise<Player> {
    return await this.playerModel.findById(id).exec();
  }

  async update(id, player: Player): Promise<Player> {
    return await this.playerModel.findByIdAndUpdate(id, player, {
      new: true,
    });
  }

  async delete(id): Promise<any> {
    return await this.playerModel.findByIdAndRemove(id);
  }
}
