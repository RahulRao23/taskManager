const { dbConnect } = require('../../config/dbConnect');
const { getUserIdsForNotification, updateTaskData } = require('../services/tasks.services');
const { USER_NOTIFICATION_STATUS, USER_STATUS } = require('../utilities/constants');
require('dotenv').config();
dbConnect();

const notifyUserHandler = async () => {
	try {
		const userList = await getUserIdsForNotification();
		userList.forEach(user => console.log(user))

		for (const user of userList) {

			if (user.user_status == USER_STATUS.DELETED) continue;

			if (user.user_notified == USER_NOTIFICATION_STATUS.IN_PROGRESS) return;

			console.log('INITIATING CALL FOR USER', user.phone_number);

			const accountSid = process.env.TWILIO_ACCOUNT_SID;
			const authToken = process.env.TWILIO_AUTH_TOKEN;
			const client = require("twilio")(accountSid, authToken);

			const res = await client.calls.create({
				method: 'GET',
				statusCallback: '<endpoint>/user/getCallbackResponse',
				statusCallbackEvent: ['initiated', 'answered'],
				statusCallbackMethod: 'POST',
				url: 'http://demo.twilio.com/docs/voice.xml',
				to: `+91${user.phone_number}`,
				from: process.env.TWILIO_PHONE_NUMBER,
			});

			await updateTaskData({
				_id: user.task_id,
			}, {
				user_notified: USER_NOTIFICATION_STATUS.IN_PROGRESS,
				call_sid: res.sid,
			});
			return;
		}

	} catch (error) {
		console.log('notifyUserHandler Error: ', error);
	}
	const date = new Date();
	return new Date(date.setMinutes(new Date().getMinutes() + 15)).toISOString().slice(0, 19);
}

module.exports = notifyUserHandler;

notifyUserHandler();

/* Uncomment below code to run cron on pm2 process at specified intervals of time */

// const callAtSpecificInterval = async () => {
// 	let nextRunAt = new Date().toISOString().slice(0, 19);
// 	setInterval(async function () {
// 		const CUR_DATE = new Date().toISOString().slice(0, 19);
// 		console.log({CUR_DATE, nextRunAt});
// 		if(CUR_DATE == nextRunAt) {
// 			nextRunAt = await notifyUserHandler();
// 		}
// 	}, 10 * 60 * 1000);
// }
// callAtSpecificInterval();
