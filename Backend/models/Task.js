import { Schema, model } from 'mongoose';

const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  aiAssistedDetails: {
    suggestedSubtasks: [{ type: String }],
    complexityScore: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    riskAssessment: { type: String }
  }
}, { timestamps: true });

export default model('Task', TaskSchema);
