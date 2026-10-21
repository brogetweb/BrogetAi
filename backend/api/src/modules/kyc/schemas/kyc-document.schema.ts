import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'kyc_documents' })
export class KycDocument {
  @Prop({ required: true })
  agentId: string;

  @Prop({ required: true })
  agentName: string;

  @Prop({ required: true, enum: ['Aadhaar', 'PAN', 'Selfie', 'Address'] })
  kind: 'Aadhaar' | 'PAN' | 'Selfie' | 'Address';

  @Prop({ required: true, trim: true })
  fileName: string;

  @Prop({ required: true, default: 'In review' })
  status: string;

  @Prop()
  storedAs?: string;
}

export type KycDocumentDocument = HydratedDocument<KycDocument>;
export const KycDocumentSchema = SchemaFactory.createForClass(KycDocument);
