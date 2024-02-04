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

/* 4. Get all user sub tasks (with filter like task_id if passed) */
subTaskRouter.get('/getAllUserSubTasks', getRequestParamsMiddleware, verifyTokenMiddleware, getAllUserSubTasks);

/* 2. Create sub task - input is task_id, description */
subTaskRouter.post('/createSubTask', getRequestParamsMiddleware, verifyTokenMiddleware, createSubTask);

/* 6. Update subtask - only status can be updated - 0,1 */
subTaskRouter.post('/updateSubTask', getRequestParamsMiddleware, verifyTokenMiddleware, updateSubTask);

/* 8. Delete sub task(soft deletion) */
subTaskRouter.post('/deleteSubTask', getRequestParamsMiddleware, verifyTokenMiddleware, deleteSubTask);

/* Error handling */
subTaskRouter.use('/', (req, res, next) => {
	console.log('Route not found: ', req.url);
	res.status(404);
	res.send('404 Not Found');
});

module.exports = subTaskRouter;