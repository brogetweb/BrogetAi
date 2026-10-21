import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'credit_reports' })
export class CreditReport {
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

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  panMasked: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop({ required: true, default: 'Yes' })
  consentAcceptance: string;

  @Prop({ required: true, enum: ['ready', 'failed'] })
  status: 'ready' | 'failed';

  @Prop()
  score?: number;

  @Prop({ required: true })
  message: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  report?: unknown;
}

export type CreditReportDocument = HydratedDocument<CreditReport>;
export const CreditReportSchema = SchemaFactory.createForClass(CreditReport);
