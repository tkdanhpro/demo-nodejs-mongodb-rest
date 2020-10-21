const NoteModel = require('./../note/note.model');
const UserModel = require('./../user/user.model');
const UserInvitationModel = require('./user_invitation.model')
const NoteNotFoundError = require('../core/error/NoteNotFoundError');
const NotificationModel = require('../user_notification/user_notification.model');

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = {
    
    getByMe: async (req, res) => {
        try {
            const _id = req.user._id;
            const invitations = await UserInvitationModel.find({ 'receiver': _id, 'status': 'WAITING' }
                , { name: 1, inviter: 1, note: 1, status: 1})
                .populate('sender', 'fullName picture')
                .populate('note', 'name');           
            res.status(201).send({ invitations });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    update: async (req, res) => {
        try {
            const id = req.body.id;
            // const noteId = req.body.noteId;
            // const senderId = req.body.senderId;
            const status = req.body.status;

            const invitation = await UserInvitationModel.findById(id);
            if (!invitation) {
                throw new NoteNotFoundError();
            }
            // update status
            invitation.status = status;

            // const note = await NoteModel.findById(invitation.note);
            // const sender = await UserModel.findById(invitation.sender);
           
            // send notification to admin who sent invitation to user
            const senderNoti = new NotificationModel({ user: invitation.sender, attachment: invitation});            
      
            switch (status) {
                case 'ACCEPTED':
                    //
                    break;
                case 'REJECTED':
                    //
                    break;
                default:
                    break;    
            }
            await senderNoti.save();

            await invitation.save()
                .then(n => n.populate('sender', 'fullName picture')
                .populate('receiver', 'fullName picture')
                    .populate('note', 'name')
                    .execPopulate());

            res.status(201).send({ invitation, status: invitation.status });
        } catch (err) {
            res.status(404).send(err);
        }
    }


}