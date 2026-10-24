import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WalletKind = 'topup' | 'usage' | 'withdraw';
export type WalletEntryStatus = 'pending' | 'success' | 'failed';

@Schema({ timestamps: true, collection: 'wallet_entries' })
export class WalletEntry {
  @Prop({ required: true, index: true })
  agentId: string;

  @Prop({ required: true, enum: ['topup', 'usage', 'withdraw'] })
  kind: WalletKind;

  @Prop({ required: true })
  amountPaise: number;

  @Prop()
  feePaise?: number;

  @Prop()
  gstPaise?: number;

  @Prop({ required: true, enum: ['pending', 'success', 'failed'], default: 'pending' })
  status: WalletEntryStatus;

  @Prop({ required: true, unique: true })
  requestId: string;

  @Prop({ trim: true })
  note?: string;

  @Prop({ trim: true })
  utr?: string;
}

export type WalletEntryDocument = HydratedDocument<WalletEntry>;
export const WalletEntrySchema = SchemaFactory.createForClass(WalletEntry);
