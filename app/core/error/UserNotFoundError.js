const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class UserNotFoundError extends ApplicationError {
    constructor(message) {
        super(message || 'User not found!', ErrorCode.USER_NOT_FOUND);
       
    }
}

module.exports = UserNotFoundError
