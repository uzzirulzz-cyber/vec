import mongoose, { Schema, Document } from 'mongoose';

export interface IPromptTemplate extends Omit<Document, 'model'> {
  name: string;
  category: 'Coding' | 'Business' | 'Marketing' | 'Writing' | 'Research' | 'Analysis' | 'Other';
  prompt: string;
  model?: string;
  createdBy: mongoose.Types.ObjectId | string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromptTemplateSchema = new Schema<IPromptTemplate>(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['Coding', 'Business', 'Marketing', 'Writing', 'Research', 'Analysis', 'Other'],
      default: 'Coding',
    },
    prompt: { type: String, required: true },
    model: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PromptTemplateModel = (mongoose.models.PromptTemplate as mongoose.Model<IPromptTemplate>) || mongoose.model<IPromptTemplate>('PromptTemplate', PromptTemplateSchema);
export default PromptTemplateModel;
