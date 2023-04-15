import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerDocument = Player & Document;

@Schema()
export class Player extends Document {
  @Prop({ default: 0 })
  currentWordIndex: number;

  @Prop()
  socketID: string;

  @Prop({ default: false })
  isPartyLeader: boolean;

  @Prop({ default: -1 })
  WPM: number;

  @Prop()
  nickName: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
