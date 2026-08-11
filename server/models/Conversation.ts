import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
  timestamp?: Date;
}

export interface IConversation extends Omit<Document, 'model'> {
  userId: mongoose.Types.ObjectId | string;
  title: string;
  model: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  id: { type: String },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const ConversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, default: 'New Conversation' },
    model: { type: String, required: true },
    messages: [ChatMessageSchema],
  },
  { timestamps: true }
);

const ConversationModel = (mongoose.models.Conversation as mongoose.Model<IConversation>) || mongoose.model<IConversation>('Conversation', ConversationSchema);
export default ConversationModel;
