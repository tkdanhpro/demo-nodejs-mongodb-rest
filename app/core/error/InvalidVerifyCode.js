const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class InvalidVerifyCode extends ApplicationError {
    constructor(message) {
        super(message || 'Invalid verfy code!', ErrorCode.INVALID_VERIFY_CODE);
       
    }
}

module.exports = InvalidVerifyCode
