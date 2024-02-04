const express = require('express');
const {
	createTask,
	getAllUserTask,
	deleteTask,
	updateTask,
} = require('../controllers/tasks.controller');

const getRequestParamsMiddleware = require('../middlewares/getRequestParams.middleware');
const verifyTokenMiddleware = require('../middlewares/validateUser.middleware');

const taskRouter = express.Router();

/* 3. Get all user task(with filter like priority, due date and proper pagination etc) */
taskRouter.get('/getAllUserTask', getRequestParamsMiddleware, verifyTokenMiddleware, getAllUserTask);

/* 1. Create task - input is title, description and due_date with jwt auth token */
taskRouter.post('/createTask', getRequestParamsMiddleware, verifyTokenMiddleware, createTask);

/* 5. Update task- due_date, status-”TODO” or “DONE” can be changed */
taskRouter.post('/updateTask', getRequestParamsMiddleware, verifyTokenMiddleware, updateTask);

/* 7. Delete task(soft deletion) */
taskRouter.post('/deleteTask', getRequestParamsMiddleware, verifyTokenMiddleware, deleteTask);

/* Error handling */
taskRouter.use('/', (req, res, next) => {
	console.log('Route not found: ', req.url);
	res.status(404);
	res.send('404 Not Found');
});

module.exports = taskRouter;