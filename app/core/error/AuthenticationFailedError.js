const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class AuthenticationFailedError extends ApplicationError {
    constructor(lang, message) {
        if (lang == 'vi') {
            super(message || 'Có gì đó sai sai! Bạn kiểm tra lại thông tin đăng nhập xem!', ErrorCode.AUTHENTICATION_FAILED);
        } else {
            super(message || 'Login failed! Check authentication credentials', ErrorCode.AUTHENTICATION_FAILED);
        }
        
    }
}

module.exports = AuthenticationFailedError