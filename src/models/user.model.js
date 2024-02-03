const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new mongoose.Schema(
	{
		name: { type: Schema.Types.String },
		phone_number: { type: Schema.Types.Number },
		auth_token: { type: Schema.Types.String },
		status: { type: Schema.Types.Number },
		priority: { type: Schema.Types.Number, enum: [0, 1, 2] },
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
);

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
