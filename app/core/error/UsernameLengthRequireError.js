const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class UsernameLengthRequireError extends ApplicationError {
    constructor(message) {
        super(message || 'Username must be greater than 5 characters!', ErrorCode.USERNAME_LENGTH_REQUIRE);
       
    }
}

module.exports = UsernameLengthRequireError