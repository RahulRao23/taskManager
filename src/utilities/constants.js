const constants = {};

constants.USER_STATUS = {
	ACTIVE: 1,
	DELETED: 2,
};

constants.PRIORITY = {
	TODAY: 0,
	ONE_TO_TWO_DAYS: 1,
	THREE_TO_FOUR_DAYS: 2,
	FIVE_PLUS_DAYS: 3,
};

constants.TASK_STATUS = {
	STATUS_CODE: {
		TODO: 1,
		IN_PROGRESS: 2,
		DONE: 3,
		DELETED: 4,
	},
	STATUS_MESSAGE: {
		1: 'TODO',
		2: 'IN_PROGRESS',
		3: 'DONE',

	},
};

constants.SUB_TASK_STATUS = {
	INCOMPLETE: 0,
	COMPLETE: 1,
	DELETED: 2,
};

constants.SUB_TASK_MESSAGE = {
	0: 'INCOMPLETE',
	1: 'COMPLETE',
	2: 'DELETED',
};

constants.TWILIO_PRIORITY = {
	P1: 0,
	P2: 1,
	P3: 2,
};

constants.USER_NOTIFICATION_STATUS = {
	NOT_NOTIFIED: 0,
	NOTIFIED: 1,
	IN_PROGRESS: 2,
}

constants.JWT_PRIVATE_KEY = '<PRIVATE-KEY>';

module.exports = constants;
