import mongoose, { Schema, Document } from 'mongoose';

export interface IApiLog extends Omit<Document, 'model'> {
  userId?: mongoose.Types.ObjectId | string;
  endpoint: string;
  model?: string;
  statusCode: number;
  responseTime: number; // in ms
  requestId: string;
  error?: string;
  ipAddress?: string;
  createdAt: Date;
}

const ApiLogSchema = new Schema<IApiLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    endpoint: { type: String, required: true },
    model: { type: String },
    statusCode: { type: Number, required: true },
    responseTime: { type: Number, required: true },
    requestId: { type: String, required: true },
    error: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

const ApiLogModel = (mongoose.models.ApiLog as mongoose.Model<IApiLog>) || mongoose.model<IApiLog>('ApiLog', ApiLogSchema);
export default ApiLogModel;
