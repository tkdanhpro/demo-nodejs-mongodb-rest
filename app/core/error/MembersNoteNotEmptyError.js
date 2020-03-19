const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class MembersNoteNotEmptyError extends ApplicationError {
    constructor(message) {
        super(message || 'Members could not be empty!', ErrorCode.MEMBER_NOTE_NOT_EMPTY);
       
    }
}

module.exports = MembersNoteNotEmptyError