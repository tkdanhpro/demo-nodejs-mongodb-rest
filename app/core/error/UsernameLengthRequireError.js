const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class UsernameLengthRequireError extends ApplicationError {
    constructor(lang, message) {
        if (lang == 'vi') {
            super(message || 'Hãy nhập tên tài khoản nhiều hơn 5 ký tự nhé!', ErrorCode.USERNAME_LENGTH_REQUIRE);
        } else {
            super(message || 'Username must be greater than 5 characters!', ErrorCode.USERNAME_LENGTH_REQUIRE);
        }
        
    }
}

module.exports = UsernameLengthRequireError