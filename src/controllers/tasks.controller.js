const {
	getUserTaskAsPOJO,
	getAllUserTasksAsPOJO,
	createTask,
	updateTaskData,
} = require('../services/tasks.services');
const {
	updateSubTaskData,
} = require('../services/subTasks.services');
const STATUS = require('../../config/statusCodes.json');
const CONSTANTS = require('../utilities/constants');
const {
	validateDate,
	calculateTaskPriority,
} = require('../utilities/validator.util');

const taskController = {};

/** 1. Create task - input is title, description and due_date with jwt auth token */
taskController.createTask = async (req, res) => {
	try {
		const { title, description, due_date } = res.locals.reqParams;
		const userData = res.locals.userData;

		/* Validate request parameters */
		if (!title || !description || !due_date) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Required data not sent',
			});
		}
		/* Validate if due_date is of correct format */
		const dueDate = validateDate(due_date);

		/* If due_date 
			1. is not of correct format or 
			2. less than current date
		return BAD_REQUEST */
		if(!dueDate) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Invalid due_date',
			});
		}

		/* Calculate priority based on due_date */
		const priority = calculateTaskPriority(dueDate);

		const newTask = await createTask({
			user_id: userData._id,
			title,
			description,
			due_date,
			status: CONSTANTS.TASK_STATUS.STATUS_CODE.TODO,
			priority: priority,
		});

		/* Return new task data in response */
		return res.status(STATUS.SUCCESS).send({
			message: 'SUCCESS',
			data: newTask,
		});

	} catch (error) {
		console.log('CreateTask ERROR: ', error);
		return res.status(STATUS.INTERNAL_SERVER_ERROR).send({
			error: 'INTERNAL_SERVER_ERROR',
			message: error.message ? error.message : 'Something went wrong' + error,
		});
	}
}

/** Get all user task(with filter like priority, due date and proper pagination etc)
 * Filter tasks by priority, due_date, status and pass a string in search param to get all tasks that contains this string
 */
taskController.getAllUserTask = async (req, res) => {
	try {
		const { priority, due_date, status, search, page, limit } = res.locals.reqParams;
		const userData = res.locals.userData;

		/* Validate request parameters */
		if (!page || !limit) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'page and limit can not be empty.',
			});
		}

		/* If status is passed then validate status code */
		if (
			status &&
			(
				status != CONSTANTS.TASK_STATUS.STATUS_CODE.TODO &&
				status != CONSTANTS.TASK_STATUS.STATUS_CODE.DONE &&
				status != CONSTANTS.TASK_STATUS.STATUS_CODE.IN_PROGRESS
			)
		) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Invalid status',
			});
		}

		/* Validate query parameters if passed */
		const queryData = { 
			user_id: userData._id,
			status: status ? status : { $ne: CONSTANTS.TASK_STATUS.STATUS_CODE.DELETED }
		};

		if (priority) queryData.priority = priority;
		if (due_date) queryData.due_date = new Date(due_date);
		if(search) {
			const regex = new RegExp(search, "i");
			queryData.title = { $regex: regex };
		}

		/* Get paginated task list */
		const taskList = await getAllUserTasksAsPOJO(
			queryData,
			{
				offset: (page - 1) * limit, 
				limit,
			}
		);

		/** Mapping status code -> status message 
		 * Eg: If status = 1 (i.e. TODO) in DB
		 * Replace status field in response as "TODO"
		*/
		taskList.forEach(task => task.status = CONSTANTS.TASK_STATUS.STATUS_MESSAGE[task.status]);

		/* Return task list in response */
		return res.status(STATUS.SUCCESS).send({
			message: 'SUCCESS',
			data: taskList,
		});

	} catch (error) {
		console.log('getAllUserTask ERROR: ', error);
		return res.status(STATUS.INTERNAL_SERVER_ERROR).send({
			error: 'INTERNAL_SERVER_ERROR',
			message: error.message ? error.message : 'Something went wrong' + error,
		});
	}
}

/** Update task- due_date, status-”TODO” or “DONE” can be changed */
taskController.updateTask = async (req, res) => {
	try {
		const { task_id, due_date, status } = res.locals.reqParams;
		const userData = res.locals.userData;

		/* Validate request parameters */
		if (!task_id || (!due_date && !status)) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'Required parameters can not be empty.',
			});
		}

		const taskData = await getUserTaskAsPOJO({
			user_id: userData._id,
			_id: task_id,
		});

		/* If no task exists or task status is marked as deleted then return error in response. */
		if (!taskData || taskData.status === CONSTANTS.TASK_STATUS.STATUS_CODE.DELETED) {
			return res.status(STATUS.UNAUTHORIZED).send({
				error: 'UNAUTHORIZED',
				message: 'Task does not exist.',
			});
		}

		const updateData = {};

		/* Validate due_date before updating */
		if (due_date) {
			const validDueDate = validateDate(due_date);
			if(!validDueDate) {
				return res.status(STATUS.BAD_REQUEST).send({
					error: 'BAD_REQUEST',
					message: 'Invalid due_date',
				});
			}

			updateData.due_date = validDueDate;
		}

		/* Validate status if passed before updating */
		if(status) {
			if (
				status != CONSTANTS.TASK_STATUS.STATUS_CODE.TODO &&
				status != CONSTANTS.TASK_STATUS.STATUS_CODE.DONE
			) {
				return res.status(STATUS.BAD_REQUEST).send({
					error: 'BAD_REQUEST',
					message: 'Invalid status',
				});
			}

			updateData.status = status;
		}
		
		await updateTaskData(
			{
				_id: task_id,
				user_id: userData._id,
			},
			updateData
		);

		/* If task is marked as "DONE" then update all sub task status as "COMPLETED" */
		if(
			status && 
			status == CONSTANTS.TASK_STATUS.STATUS_CODE.DONE
		) {
			await updateSubTaskData({
				task_id: taskData._id,
			}, {
				status: CONSTANTS.SUB_TASK_STATUS.COMPLETE,
			});
		}
		

		return res.status(STATUS.SUCCESS).send({
			message: 'SUCCESS',
			data: {},
		});

	} catch (error) {
		console.log('Update task ERROR: ', error);
		return res.status(STATUS.INTERNAL_SERVER_ERROR).send({
			error: 'INTERNAL_SERVER_ERROR',
			message: error.message ? error.message : 'Something went wrong' + error,
		});
	}
}

/** Delete task(soft deletion) */
taskController.deleteTask = async (req, res) => {
	try {
		const { task_id } = res.locals.reqParams;
		const userData = res.locals.userData;

		/* Validate request parameters */
		if (!task_id) {
			return res.status(STATUS.BAD_REQUEST).send({
				error: 'BAD_REQUEST',
				message: 'task_id can not be empty.',
			});
		}

		const taskData = await getUserTaskAsPOJO({
			user_id: userData._id,
			_id: task_id,
		});

		/* If no task exists or task status is marked as deleted then return error in response. */
		if (!taskData || taskData.status === CONSTANTS.TASK_STATUS.STATUS_CODE.DELETED) {
			return res.status(STATUS.UNAUTHORIZED).send({
				error: 'UNAUTHORIZED',
				message: 'Task does not exist.',
			});
		}

		await updateTaskData({
			_id: task_id,
			user_id: userData._id,
		}, {
			status: CONSTANTS.TASK_STATUS.STATUS_CODE.DELETED,
		});

		/* Update all sub tasks as "DELETED" on task deletion. */
		await updateSubTaskData({
			task_id: taskData._id,
		}, {
			status: CONSTANTS.SUB_TASK_STATUS.DELETED,
		});

		return res.status(STATUS.SUCCESS).send({
			message: 'SUCCESS',
			data: {},
		});

	} catch (error) {
		console.log('Delete task ERROR: ', error);
		return res.status(STATUS.INTERNAL_SERVER_ERROR).send({
			error: 'INTERNAL_SERVER_ERROR',
			message: error.message ? error.message : 'Something went wrong' + error,
		});
	}
}

module.exports = taskController;