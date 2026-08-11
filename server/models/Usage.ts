import mongoose, { Schema, Document } from 'mongoose';

export interface IUsage extends Omit<Document, 'model'> {
  userId: mongoose.Types.ObjectId | string;
  model: string;
  endpoint: string;
  tokens: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  requestStatus: 'success' | 'error';
  responseTime: number; // in ms
  createdAt: Date;
}

const UsageSchema = new Schema<IUsage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    model: { type: String, required: true },
    endpoint: { type: String, required: true },
    tokens: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
    requestStatus: { type: String, enum: ['success', 'error'], required: true },
    responseTime: { type: Number, required: true },
  },
  { timestamps: true }
);

const UsageModel = (mongoose.models.Usage as mongoose.Model<IUsage>) || mongoose.model<IUsage>('Usage', UsageSchema);
export default UsageModel;
