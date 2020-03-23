const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class PasswordLengthRequireError extends ApplicationError {
    constructor(message) {
        super(message || 'Password length must be greater than 6 characters!', ErrorCode.PASSWORD_LENGTH_REQUIRE);
    }
}

module.exports = PasswordLengthRequireError
