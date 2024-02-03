const {
	getUserTask,
	updateTaskData,
} = require('../services/tasks.services');
const {
	createSubTask,
	updateSubTaskData,
	getUserSubTaskDetailsAsPOJO,
	getUserSubTasks,
	getUserSubTaskDetails,
	getSubTaskList,
} = require('../services/subTasks.services');
const STATUS = require('../../config/statusCodes.json');
const CONSTANTS = require('../utilities/constants');

const subTaskController = {};

/** Create sub task - input is task_id */
subTaskController.createSubTask = async (req, res) => {
	try {
		const { task_id, description } = res.locals.reqParams;
		const userData = res.locals.userData;

		if (!task_id || !description) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Required data not sent',
			});
		}

		const taskData = await getUserTask({ _id: task_id, user_id: userData._id });
		if (!taskData || taskData.status === CONSTANTS.TASK_STATUS.STATUS_CODE.DELETED) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Task does not exist.',
			});
		}

		if(taskData.status === CONSTANTS.TASK_STATUS.STATUS_CODE.DONE) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Can not add sub task to completed task.',
			});
		}

		const newSubTask = await createSubTask({
			task_id: task_id,
			description,
			status: CONSTANTS.SUB_TASK_STATUS.INCOMPLETE,
		});

		/* Return user data in response */
		return res.status(STATUS.SUCCESS).send({
			message: 'SUCCESS',
			data: newSubTask,
		});

	} catch (error) {
		console.log('Create sub task ERROR: ', error);
		return res.status(STATUS.INTERNAL_SERVER_ERROR).send({
			error: 'INTERNAL_SERVER_ERROR',
			message: error.message ? error.message : 'Something went wrong' + error,
		});
	}
}

subTaskController.getAllUserSubTasks = async (req, res) => {
	try {
		const { task_id, status } = res.locals.reqParams;
		const userData = res.locals.userData;

		const queryData = {
			user_id: userData._id,
			status: status ? status : { $ne: CONSTANTS.SUB_TASK_STATUS.DELETED },
		};

		if (task_id) queryData.task_id = task_id;

		const userSubTasks = await getUserSubTasks(queryData);

		userSubTasks.forEach(task => task.status = CONSTANTS.SUB_TASK_MESSAGE[task.status]);

		return res.status(STATUS.SUCCESS).send({
			message: 'SUCCESS',
			data: userSubTasks,
		});

	} catch (error) {
		console.log('getAllUserSubTasks ERROR: ', error);
		return res.status(STATUS.INTERNAL_SERVER_ERROR).send({
			error: 'INTERNAL_SERVER_ERROR',
			message: error.message ? error.message : 'Something went wrong' + error,
		});
	}
}

subTaskController.updateSubTask = async (req, res) => {
	try {
		const { sub_task_id, status } = res.locals.reqParams;
		const userData = res.locals.userData;

		if(!sub_task_id || !status) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Required data not sent',
			});
		}

		if (
			status != CONSTANTS.SUB_TASK_STATUS.INCOMPLETE &&
			status != CONSTANTS.SUB_TASK_STATUS.COMPLETE
		) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Invalid status',
			});
		}

		const subTaskData = await getUserSubTaskDetails({
			_id: sub_task_id,
			status: { $ne: CONSTANTS.SUB_TASK_STATUS.DELETED }
		});

		if(!subTaskData) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Sub Task does not exist.',
			});
		}

		subTaskData.status = status;
		await subTaskData.save();

		const subTasksList = await getSubTaskList({
			task_id: subTaskData.task_id,
			status: { $ne: CONSTANTS.SUB_TASK_STATUS.DELETED }
		});

		const inCompleteSubTasks = subTasksList.filter(({status}) => status == CONSTANTS.SUB_TASK_STATUS.INCOMPLETE ).length;
		const completedSubTasks = subTasksList.filter(({status}) => status == CONSTANTS.SUB_TASK_STATUS.COMPLETE ).length;

		if (!completedSubTasks) {
			await updateTaskData({
				_id: subTaskData.task_id
			}, {
				status: CONSTANTS.TASK_STATUS.STATUS_CODE.TODO
			})
		}
		else if (inCompleteSubTasks && completedSubTasks) {
			await updateTaskData({
				_id: subTaskData.task_id
			}, {
				status: CONSTANTS.TASK_STATUS.STATUS_CODE.IN_PROGRESS
			});
		}
		else if (!inCompleteSubTasks) {
			await updateTaskData({
				_id: subTaskData.task_id
			}, {
				status: CONSTANTS.TASK_STATUS.STATUS_CODE.DONE
			});
		}
		
		return res.status(STATUS.SUCCESS).send({
			message: 'SUCCESS',
			data: {},
		});

	} catch (error) {
		console.log('updateSubTask ERROR: ', error);
		return res.status(STATUS.INTERNAL_SERVER_ERROR).send({
			error: 'INTERNAL_SERVER_ERROR',
			message: error.message ? error.message : 'Something went wrong' + error,
		});
	}
}

subTaskController.deleteSubTask = async (req, res) => {
	try {
		const { sub_task_id } = res.locals.reqParams;

		if (!sub_task_id) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Required data not sent',
			});
		}

		const subTaskData = await getUserSubTaskDetailsAsPOJO({
			_id: sub_task_id,
			status: { $ne: CONSTANTS.SUB_TASK_STATUS.DELETED }
		});

		if(!subTaskData) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Sub Task does not exist.',
			});
		}

		const taskData = await getUserTask({
			_id: subTaskData.task_id,
			status: { $ne: CONSTANTS.TASK_STATUS.STATUS_CODE.DELETED }
		});
		if(!taskData) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Task does not exist.',
			});
		}

		await updateSubTaskData(
			{
				_id: sub_task_id,
			},
			{
				status: CONSTANTS.SUB_TASK_STATUS.DELETED,
			}
		);

		const subTasksList = await getSubTaskList({
			task_id: subTaskData.task_id,
			status: { $ne: CONSTANTS.SUB_TASK_STATUS.DELETED }
		});

		const inCompleteSubTasks = subTasksList.filter(({status}) => status == CONSTANTS.SUB_TASK_STATUS.INCOMPLETE );
		const completedSubTasks = subTasksList.filter(({status}) => status == CONSTANTS.SUB_TASK_STATUS.COMPLETE ).length;

		if (!completedSubTasks) {
			await updateTaskData({
				_id: subTaskData.task_id
			}, {
				status: CONSTANTS.TASK_STATUS.STATUS_CODE.TODO
			})
		}
		else if (inCompleteSubTasks && completedSubTasks) {
			await updateTaskData({
				_id: subTaskData.task_id
			}, {
				status: CONSTANTS.TASK_STATUS.STATUS_CODE.IN_PROGRESS
			});
		}
		else if (!inCompleteSubTasks) {
			await updateTaskData({
				_id: subTaskData.task_id
			}, {
				status: CONSTANTS.TASK_STATUS.STATUS_CODE.DONE
			});
		}

		return res.status(STATUS.SUCCESS).send({
			message: 'SUCCESS',
			data: {},
		});

	} catch (error) {
		console.log('deleteSubTask ERROR: ', error);
		return res.status(STATUS.INTERNAL_SERVER_ERROR).send({
			error: 'INTERNAL_SERVER_ERROR',
			message: error.message ? error.message : 'Something went wrong' + error,
		});
	}
}

module.exports = subTaskController;