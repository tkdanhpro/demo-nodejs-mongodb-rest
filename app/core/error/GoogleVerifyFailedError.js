const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class GoogleVerifyFailedError extends ApplicationError {
    constructor(message) {
        super(message, ErrorCode.GOOGLE_VERIFY_FAILED);

    }
}

module.exports = GoogleVerifyFailedError