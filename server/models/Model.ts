import mongoose, { Schema, Document } from 'mongoose';

export interface IModel extends Document {
  name: string;
  modelId: string;
  provider: string;
  type: 'chat' | 'coding' | 'reasoning' | 'vision' | 'image' | 'video' | 'embeddings' | 'other';
  capabilities: string[];
  description: string;
  enabled: boolean;
  maxTokens?: number;
  contextWindow?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ModelSchema = new Schema<IModel>(
  {
    name: { type: String, required: true },
    modelId: { type: String, required: true, unique: true },
    provider: { type: String, default: 'VectorEngine' },
    type: {
      type: String,
      enum: ['chat', 'coding', 'reasoning', 'vision', 'image', 'video', 'embeddings', 'other'],
      default: 'chat',
    },
    capabilities: [{ type: String }],
    description: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    maxTokens: { type: Number, default: 4096 },
    contextWindow: { type: Number, default: 128000 },
  },
  { timestamps: true }
);

const ModelModel = (mongoose.models.Model as mongoose.Model<IModel>) || mongoose.model<IModel>('Model', ModelSchema);
export default ModelModel;
