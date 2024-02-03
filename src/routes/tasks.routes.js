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

taskRouter.get('/getAllUserTask', getRequestParamsMiddleware, verifyTokenMiddleware, getAllUserTask);

taskRouter.post('/createTask', getRequestParamsMiddleware, verifyTokenMiddleware, createTask);

taskRouter.post('/updateTask', getRequestParamsMiddleware, verifyTokenMiddleware, updateTask);

taskRouter.post('/deleteTask', getRequestParamsMiddleware, verifyTokenMiddleware, deleteTask);

/* Error handling */
taskRouter.use('/', (req, res, next) => {
	console.log('Route not found: ', req.url);
	res.status(404);
	res.send('404 Not Found');
});

module.exports = taskRouter;