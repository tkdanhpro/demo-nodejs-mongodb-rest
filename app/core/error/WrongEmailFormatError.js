const ApplicationError = require('./ApplicationError');
class WrongEmailFormatError extends ApplicationError {
    constructor(lang, message) {
        if (lang == 'vi') {
            super(message || 'Bạn nhập sai định dạng email rùi!');
        } else {
            super(message || 'Wrong email format!');
        }
        
    }
}

module.exports = WrongEmailFormatError