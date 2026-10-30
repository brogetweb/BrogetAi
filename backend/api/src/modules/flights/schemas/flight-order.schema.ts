import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'flight_orders' })
export class FlightOrder {
  @Prop({ required: true, index: true })
  requestId!: string;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  travellerId!: Types.ObjectId;

  @Prop({ default: '' })
  travellerName!: string;

  @Prop({ default: '' })
  travellerEmail!: string;

  @Prop({ default: '' })
  travellerPhone!: string;

  @Prop({ enum: ['domestic', 'international'], default: 'domestic' })
  sector!: 'domestic' | 'international';

  @Prop({ required: true })
  markupPercent!: number;

  @Prop({ required: true })
  netFarePaise!: number;

  @Prop({ required: true })
  markupPaise!: number;

  @Prop({ required: true })
  gstPaise!: number;

  @Prop({ required: true })
  totalPaise!: number;

  @Prop({ enum: ['pending', 'paid', 'ticketed', 'failed'], default: 'pending', index: true })
  status!: 'pending' | 'paid' | 'ticketed' | 'failed';

  @Prop({ default: '' })
  paymentMode!: string;

  @Prop({ default: '' })
  checkoutUrl!: string;

  @Prop({ default: '' })
  utr!: string;

  @Prop({ default: '' })
  pnr!: string;

  @Prop({ type: Object, default: {} })
  flight!: Record<string, unknown>;

  @Prop({ type: [Object], default: [] })
  passengers!: Record<string, unknown>[];

  @Prop({ default: '' })
  note!: string;
}

export type FlightOrderDocument = HydratedDocument<FlightOrder>;
export const FlightOrderSchema = SchemaFactory.createForClass(FlightOrder);
FlightOrderSchema.index({ createdAt: -1 });
