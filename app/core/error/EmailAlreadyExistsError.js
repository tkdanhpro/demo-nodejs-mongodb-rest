const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class EmailAlreadyExistsError extends ApplicationError {
    constructor(message) {
        super(message || 'Email already exists!', ErrorCode.EMAIL_ALREADY_EXISTS);
    }
}

module.exports = EmailAlreadyExistsError
