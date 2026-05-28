import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISavedJob extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
  savedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const savedJobSchema = new Schema<ISavedJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    savedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const SavedJob = mongoose.models.SavedJob || mongoose.model<ISavedJob>('SavedJob', savedJobSchema);

export default SavedJob;