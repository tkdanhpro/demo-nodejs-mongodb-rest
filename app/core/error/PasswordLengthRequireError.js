const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class PasswordLengthRequireError extends ApplicationError {
    constructor(lang, message) {
        if (lang == 'vi') {
            super(message || 'Mật khẩu của bạn phải dài ít nhất 6 ký tự nha!', ErrorCode.PASSWORD_LENGTH_REQUIRE);
        } else {
            super(message || 'Password length must be greater than 6 characters!', ErrorCode.PASSWORD_LENGTH_REQUIRE);
        }
        
    }
}

module.exports = PasswordLengthRequireError