const { TasksModel } = require('../models/models');
const { TASK_STATUS, USER_NOTIFICATION_STATUS } = require('../utilities/constants');
const taskService = {};

taskService.createTask = async (taskData) => {
	const newTask = new TasksModel(taskData);
	return await newTask.save();
}

/* Get all user tasks as POJO which is ligher */
taskService.getAllUserTasksAsPOJO = async (filterData, paginationData) => {
	return (
		await TasksModel
		.find(filterData)
		.skip(paginationData.offset)
		.limit(paginationData.limit)
		.lean()
	);
}

taskService.getUserTaskAsPOJO = async (filterData) => {
	return (
		await TasksModel
		.findOne(filterData)
		.lean()
	);
}

taskService.getUserTask = async (filterData) => {
	return (
		await TasksModel
		.findOne(filterData)
	);
}

taskService.updateTaskData = async (whereData, updateData) => {
	return await TasksModel.updateOne(whereData, updateData);
}

taskService.updatePriority = async (updateData) => {
	return (
		await TasksModel.bulkWrite(updateData)
	);
}

taskService.getUserIdsForNotification = async () => {
	const currentDate = new Date();
	return await TasksModel.aggregate([
    {
			$match: {
				$and: [
					{ status: { $nin: [TASK_STATUS.STATUS_CODE.DONE, TASK_STATUS.STATUS_CODE.DELETED] } },
					{ due_date: { $lt: currentDate } },
					{ user_notified: { $in: [ USER_NOTIFICATION_STATUS.NOT_NOTIFIED, USER_NOTIFICATION_STATUS.IN_PROGRESS ]} },
				],
			},
    },
    {
			$lookup: {
				from: 'users',
				localField: 'user_id',
				foreignField: '_id',
				as: 'user',
			},
    },
    {
			$unwind: '$user',
    },
    {
			$sort: {
				'user.priority': 1,
			},
    },
    {
			$project: {
				user_id: '$user._id',
				task_id: '$_id',
				phone_number: '$user.phone_number',
				user_priority: '$user.priority',
				title: '$title',
				due_date: '$due_date',
				user_status: '$user.status',
				status: '$status',
				user_notified: '$user_notified',
			},
    },
])
}

module.exports = taskService;