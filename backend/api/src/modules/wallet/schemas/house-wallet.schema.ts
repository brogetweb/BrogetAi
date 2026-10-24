import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'house_wallet' })
export class HouseWallet {
  @Prop({ required: true, unique: true, default: 'broget' })
  key: string;

  @Prop({ default: 0 })
  balancePaise: number;
}

export type HouseWalletDocument = HydratedDocument<HouseWallet>;
export const HouseWalletSchema = SchemaFactory.createForClass(HouseWallet);
