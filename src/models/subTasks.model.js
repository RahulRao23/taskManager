const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubTasksSchema = new mongoose.Schema(
	{
		task_id: { type: Schema.Types.ObjectId, ref: 'Tasks' },
		status: { type: Schema.Types.Number, enum: [0, 1], default: 1 },
		description: { type: Schema.Types.String },
		deleted_at: { type: Schema.Types.Date },
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
);

const SubTasksModel = mongoose.model('SubTasks', SubTasksSchema);

module.exports = SubTasksModel;
