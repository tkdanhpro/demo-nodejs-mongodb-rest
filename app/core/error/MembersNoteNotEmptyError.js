const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class MembersNoteEmptyError extends ApplicationError {
    constructor(message) {
        super(message || 'Members could not be empty!', ErrorCode.MEMBER_NOTE_EMPTY);
       
    }
}

module.exports = MembersNoteEmptyError