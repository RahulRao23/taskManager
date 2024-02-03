const { TasksModel } = require('../models/models');
const { PRIORITY } = require('../utilities/constants');
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

module.exports = taskService;