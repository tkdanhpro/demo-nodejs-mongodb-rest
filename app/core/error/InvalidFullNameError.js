const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class InvalidFullNameError extends ApplicationError {
    constructor(lang, message) {
        if (lang == 'vi') {
            super(message || 'Hãy nhập tên của bạn nhiều hơn 2 ký tự nhé!', ErrorCode.INVALID_FULL_NAME);
        } else {
            super(message || 'Full name must be greater than 2 characters!', ErrorCode.INVALID_FULL_NAME);
        }
        
    }
}

module.exports = InvalidFullNameError