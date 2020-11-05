const NoteModel = require('./../note/note.model');
const UserModel = require('./../user/user.model');
const UserNotificationModel = require('./user_notification.model')
const NoteNotFoundError = require('../core/error/NoteNotFoundError')

module.exports = {
    
    getByMe: async (req, res) => {
        try {
            const _id = req.user._id;
            const notifications = await UserNotificationModel.find({ 'user': _id, deleted: false}
                , { title: 1, attachment: 1, status: 1, type: 1})

            res.status(201).send({ notifications });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    update: async (req, res) => {
        try {
            const id = req.body.id;
            const notification = await UserNotificationModel.findById(id);
            if (!notification) {
                throw new NoteNotFoundError();
            }

            notification.status = req.body.status;
           
            await notification.save();

            res.status(201).send({ notification});
        } catch (err) {
            res.status(404).send(err);
        }
    }


}