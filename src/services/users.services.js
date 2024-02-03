const { UserModel } = require('../models/models');

const userServices = {};

userServices.getAllUsers = async () => {
	const users = await UserModel.find();
	return users;
};

userServices.getUserDetails = async queryData => {
	return await UserModel.findOne(queryData);
};

userServices.getUserDetailsAsPOJO = async queryData => {
	return await UserModel.findOne(queryData).lean();
};

userServices.createUser = async userData => {
	const newUser = new UserModel(userData);
	return await newUser.save();
};

userServices.updateUser = async (whereClause, userData) => {
	return await UserModel.updateOne(whereClause, userData);
};

userServices.getInactiveChatGroupMembers = async (roomId) => {
	return await UserModel.find({
		$and: [
			{
				$or: [
					{ auth_token: { $exists: false } },
					{ auth_token: '' },
				]
			},
			{
				chat_groups: { $elemMatch: { $eq: roomId } }
			}
		]
	});
}

userServices.getFriendsList = async (friendsIds) => {
	return await UserModel.find({
		_id: { $in: friendsIds }
	})
	.select('_id name email');
}

module.exports = userServices;
