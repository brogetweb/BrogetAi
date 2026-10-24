import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'agents' })
export class Agent {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' })
  status: 'active' | 'inactive';

  @Prop({ default: 0 })
  walletBalancePaise: number;

  @Prop({ default: false })
  testCreditApplied?: boolean;
}

export type AgentDocument = HydratedDocument<Agent>;
export const AgentSchema = SchemaFactory.createForClass(Agent);
