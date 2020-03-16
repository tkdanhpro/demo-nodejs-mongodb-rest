const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class UsernameAlreadyExistsError extends ApplicationError {
    constructor(message) {
        super(message || 'Username already exists', ErrorCode.USERNAME_ALREADY_EXISTS);
    }
}

module.exports = UsernameAlreadyExistsError