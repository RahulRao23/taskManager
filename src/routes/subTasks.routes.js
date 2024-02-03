const express = require('express');
const {
	createSubTask,
	getAllUserSubTasks,
	updateSubTask,
	deleteSubTask,
} = require('../controllers/subTask.controller');

const getRequestParamsMiddleware = require('../middlewares/getRequestParams.middleware');
const verifyTokenMiddleware = require('../middlewares/validateUser.middleware');

const subTaskRouter = express.Router();

subTaskRouter.get('/getAllUserSubTasks', getRequestParamsMiddleware, verifyTokenMiddleware, getAllUserSubTasks);

subTaskRouter.post('/createSubTask', getRequestParamsMiddleware, verifyTokenMiddleware, createSubTask);

subTaskRouter.post('/updateSubTask', getRequestParamsMiddleware, verifyTokenMiddleware, updateSubTask);

subTaskRouter.post('/deleteSubTask', getRequestParamsMiddleware, verifyTokenMiddleware, deleteSubTask);

/* Error handling */
subTaskRouter.use('/', (req, res, next) => {
	console.log('Route not found: ', req.url);
	res.status(404);
	res.send('404 Not Found');
});

module.exports = subTaskRouter;