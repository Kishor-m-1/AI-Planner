import { Schema, model } from 'mongoose';

const ProjectSchema = new Schema({
  name: { type: String, required: true, trim: true },
  teamSize: { type: Number, default: 1, min: 1 },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default model('Project', ProjectSchema);