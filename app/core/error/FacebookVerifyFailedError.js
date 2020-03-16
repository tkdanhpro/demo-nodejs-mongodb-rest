const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class FacebookVerifyFailedError extends ApplicationError {
    constructor(message) {
        super(message, ErrorCode.FACEBOOK_VERIFY_FAILED);

    }
}

module.exports = FacebookVerifyFailedError