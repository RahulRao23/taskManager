const express = require('express');
const {
	createUser,
	getCallbackResponse,
} = require('../controllers/user.controller');

const getRequestParamsMiddleware = require('../middlewares/getRequestParams.middleware');

const userRouter = express.Router();

/* User Routes */
userRouter.post('/createUser', getRequestParamsMiddleware, createUser);

userRouter.post('/getCallbackResponse', getRequestParamsMiddleware, getCallbackResponse);

/* Error handling */
userRouter.use('/', (req, res, next) => {
	console.log('Route not found: ', req.url);
	res.status(404);
	res.send('404 Not Found');
});

module.exports = userRouter;
