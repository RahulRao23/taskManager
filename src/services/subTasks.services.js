const { SubTasksModel } = require('../models/models');

const subTaskService = {};

subTaskService.updateSubTaskData = async (whereData, updateData) => {
	return await SubTasksModel.updateMany(whereData, updateData);
}

subTaskService.createSubTask = async (subTaskData) => {
	const newSubTask = new SubTasksModel(subTaskData);
	return await newSubTask.save();
}

subTaskService.getAllUserSubTasksAsPOJO = async (filterData, paginationData) => {
	return (
		await SubTasksModel
		.find(filterData)
		.skip(paginationData.offset)
		.limit(paginationData.limit)
		.lean()
	);
}

subTaskService.getSubTaskList = async (filterData) => {
	return (
		await SubTasksModel
		.find(filterData)
	);
}

subTaskService.getUserSubTaskDetailsAsPOJO = async (filterData) => {
	return (
		await SubTasksModel
		.findOne(filterData)
		.lean()
	);
}

subTaskService.getUserSubTaskDetails = async (filterData) => {
	return (
		await SubTasksModel
		.findOne(filterData)
	);
}

subTaskService.getUserSubTasks = async (filterData) => {
	const matchData = {
		'task.user_id': filterData.user_id,
	};
	if (filterData.task_id) matchData['task._id'] = filterData.task_id;
	if (filterData.status) matchData['status'] = filterData.status

	return (
		await SubTasksModel
		.aggregate([
			{
				$lookup: {
					from: 'tasks', 
					localField: 'task_id', 
					foreignField: '_id', 
					as: 'task'
				}
			}, {
				$match: matchData,
			}, {
				$project: {
					_id: 0, 
					subtask_id: '$_id', 
					description: 1,
					task_id: 1, 
					status: 1
				}
			}
		])
	);
}

module.exports = subTaskService;