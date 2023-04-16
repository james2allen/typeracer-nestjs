import { Player } from 'src/players/player.schema';

export class UpdateGameDto {
  isOpen?: boolean;
  players?: Player[];
  startTime?: number;
  isOver?: boolean;
}
