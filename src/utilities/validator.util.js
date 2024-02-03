const { PRIORITY } = require('./constants');

const validatorUtil = {};

validatorUtil.validateDate = (date) => {
	const newDate = new Date(date);
	const currentDate = new Date();
	if(isNaN(newDate)) return false;
	else if (newDate < currentDate) return false;
	return newDate; 
}

validatorUtil.calculateTaskPriority = (dueDate) => {
  const currentDate = new Date();
  const timeDifference = dueDate - currentDate;

  /* Convert time difference to days */ 
  const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

  if (dueDate <= currentDate) {
    return PRIORITY.TODAY;
  } else if (daysDifference <= 2) {
    return PRIORITY.ONE_TO_TWO_DAYS;
  } else if (daysDifference <= 4) {
    return PRIORITY.THREE_TO_FOUR_DAYS;
  } else {
    return PRIORITY.FIVE_PLUS_DAYS;
  }
}

module.exports = validatorUtil;