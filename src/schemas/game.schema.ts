import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Player } from './player.schema';

@Schema()
export class Game extends Document {
  @Prop([String])
  words: string[];

  @Prop({ default: true })
  isOpen: boolean;

  @Prop({ default: false })
  isOver: boolean;

  @Prop([Player])
  players: Player[];

  @Prop()
  startTime: number;
}
