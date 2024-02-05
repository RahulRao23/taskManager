const { dbConnect } = require('../../config/dbConnect');
const { updatePriority } = require('../services/tasks.services');
const { PRIORITY, TASK_STATUS: { STATUS_CODE } } = require('../utilities/constants');

dbConnect();

const priorityUpdateHandler = async () => {
	try {

		console.log(`Priority Update Cron START TIME: ${new Date()}`);
		const date = new Date(new Date().setHours(0, 0, 0, 0));

		console.log({
			1: new Date(date.setDate(new Date().getDate())).toISOString(),
			2: new Date(date.setDate(new Date().getDate()+1)).toISOString(),
			3: new Date(date.setDate(new Date().getDate()+2)).toISOString(),
			4: new Date(date.setDate(new Date().getDate()+3)).toISOString(),
			5: new Date(date.setDate(new Date().getDate()+4)).toISOString(),
			6: new Date(date.setDate(new Date().getDate()+5)).toISOString(),
		});

		const array = [
			// 0 - Due date is today //0
			{
				updateMany: {
					filter: {
						$and: [
							{ status: { $nin: [ STATUS_CODE.DELETED ] }},
							{ 
								due_date: {
									'$gte': new Date(date.setDate(new Date().getDate())).toISOString(),
									'$lt': new Date(date.setDate(new Date().getDate()+1)).toISOString()
								}
							},
						]
					},
					update: {
						priority: PRIORITY.TODAY,
					}
				}
			},
			// 1 - Due date is between tomorrow and day after tomorrow // 1-2
			{
				updateMany: {
					filter: {
						$and: [
							{ status: { $nin: [ STATUS_CODE.DELETED ] }},
							{ 
								due_date: {
									'$gte': new Date(date.setDate(new Date().getDate()+1)).toISOString() ,
									'$lte': new Date(date.setDate(new Date().getDate()+2)).toISOString() 
								}
							},
						]
					},
					update: {
						priority: PRIORITY.ONE_TO_TWO_DAYS,
					}
				}
			},
			// 2 - Due date 3 or 4 days from current date
			{
				updateMany: {
					filter: {
						$and: [
							{ status: { $nin: [ STATUS_CODE.DELETED ] }},
							{ 
								due_date: {
									'$gte': new Date(date.setDate(new Date().getDate()+3)).toISOString() ,
									'$lte': new Date(date.setDate(new Date().getDate()+4)).toISOString() 
								}
							},
						]
					},
					update: {
						priority: PRIORITY.THREE_TO_FOUR_DAYS,
					}
				}
			},
			// 3 - Due date is 5 or more days from current date
			{
				updateMany: {
					filter: {
						$and: [
							{ status: { $nin: [ STATUS_CODE.DELETED ] }},
							{ 
								due_date: {
									'$gte': new Date(date.setDate(new Date().getDate()+5)).toISOString() ,
								}
							},
						]
					},
					update: {
						priority: PRIORITY.FIVE_PLUS_DAYS,
					}
				}
			},
		];

		await updatePriority(array);

		console.log(`Priority Update Cron END TIME: ${new Date()}`);

	} catch (error) {
		console.log("priorityUpdateHandler Error: ", error);
	}
	const date = new Date();
	return new Date(date.setDate(new Date().getDate() + 1)).toISOString().slice(0, 10);
}

module.exports = priorityUpdateHandler;


/* DEBUG: Uncomment below function call to run the script for testing */
// priorityUpdateHandler();

/* Uncomment below code to run cron on pm2 process at specified intervals of time */

// const callAtSpecificInterval = async () => {
// 	let nextRunAt = new Date().toISOString().slice(0, 10);
// 	setInterval(async function () {
// 		const CUR_DATE = new Date().toISOString().slice(0, 10);
// 		console.log({CUR_DATE, nextRunAt});
// 		if(CUR_DATE == nextRunAt) {
// 			nextRunAt = await priorityUpdateHandler();
// 		}
// 	}, 1 * 5 * 1000);
// }
// callAtSpecificInterval();
