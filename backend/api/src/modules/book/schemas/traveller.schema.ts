import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'book_travellers' })
export class Traveller {
  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, unique: true, trim: true })
  phone!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ trim: true, default: '' })
  city?: string;

  @Prop({ enum: ['Male', 'Female', 'Other'], default: 'Male' })
  gender?: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status!: 'active' | 'inactive';
}

export type TravellerDocument = HydratedDocument<Traveller>;
export const TravellerSchema = SchemaFactory.createForClass(Traveller);
