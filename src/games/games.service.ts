import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UpdateGameDto } from './dto/update-game.dto';
import { GamesRepository } from './games.repository';
import { Game, GameDocument } from './game.schema';

@Injectable()
export class GamesService {
  constructor(private readonly gameRepository: GamesRepository) {}

  async getGameById(gameId: string): Promise<Game> {
    return this.gameRepository.findOne({ gameId });
  }

  async createGame(words: string[]): Promise<Game> {
    return this.gameRepository.create({
      id: uuidv4(),
      words,
      isOver: false,
      isOpen: true,
      players: [],
      startTime: null,
    });
  }

  async updateGame(gameId: string, gameUpdates: UpdateGameDto): Promise<Game> {
    return this.gameRepository.findOneAndUpdate({ gameId }, gameUpdates);
  }
}
