const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class IncorrectOldPassword extends ApplicationError {
    constructor(message) {
        super(message || 'Old password is incorrect', ErrorCode.INCORRECT_OLD_PASSWORD_ERROR);
       
    }
}

module.exports = IncorrectOldPassword
