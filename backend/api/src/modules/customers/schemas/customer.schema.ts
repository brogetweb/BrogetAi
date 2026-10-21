import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'customers' })
export class Customer {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true })
  agentId: string;

  @Prop({ required: true })
  agentName: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  pan: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop({ required: true, default: 'Pending' })
  kyc: string;

  @Prop()
  score?: number;

  @Prop({ required: true, default: 'Not checked' })
  cibil: string;
}

export type CustomerDocument = HydratedDocument<Customer>;
export const CustomerSchema = SchemaFactory.createForClass(Customer);
