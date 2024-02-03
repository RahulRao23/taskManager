const mongoose = require('mongoose');
const { Schema } = mongoose;

const TasksSchema = new mongoose.Schema(
	{
		user_id: { type: Schema.Types.ObjectId, ref: 'User' },
		title: { type: Schema.Types.String },
		description: { type: Schema.Types.String },
		due_date: { type: Schema.Types.Date },
		status: { type: Schema.Types.Number, default: 1 },
		priority: { type: Schema.Types.Number, enum: [0, 1, 2, 3], default: 0 },
		user_notified: { type: Schema.Types.Number, default: 0 },
		call_sid: { type: Schema.Types.String },
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
);

const TasksModel = mongoose.model('Tasks', TasksSchema);

module.exports = TasksModel;
