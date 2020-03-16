const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class InvalidUsernameError extends ApplicationError {
    constructor(lang, message) {
        if (lang == 'vi') {
            super(message || 'Tên tài khoản của bạn không hợp lệ rùi!', ErrorCode.INVALID_USERNAME);
        } else {
            super(message || 'Invalid username!', ErrorCode.INVALID_USERNAME);
        }
        
    }
}

module.exports = InvalidUsernameError