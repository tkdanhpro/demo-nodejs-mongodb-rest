const NoteModel = require('./note.model');
const TransModel = require('./../transaction/transaction.model')
const UserTransTrackingModel = require('./../user_trans_tracking/user_trans_tracking.model')
const PermissionDeniedError = require('../core/error/PermissionDeniedError')
const MembersNoteNotEmptyError = require('../core/error/MembersNoteNotEmptyError')
const NoteNotFoundError = require('../core/error/NoteNotFoundError')
const NoteCompletedError = require('../core/error/NoteCompletedError')

module.exports = {
    addNote: async (req, res) => {
        try {
            const user = req.user;
            const data = req.body.data;
            if (!data.members.length)
                throw new MembersNoteNotEmptyError();
            data.createdBy = user._id;
            data.admin = user._id;
            data.members = data.members.concat({ user });
            const note = new NoteModel(data);
            await note.save()
                .then(n => n.populate('members.user', 'username fullName picture')
                    .populate('admin', 'username fullName picture')
                    .execPopulate());
            res.status(201).send({ note });

        } catch (err) {
            res.status(404).send(err);
        }

    },
    getById: async (req, res) => {
        try {

            const notes = await NoteModel.findById(req.params.id)
                .populate({
                    path: 'transactions',
                    select: 'title type value payments',
                    populate: { path: 'payments.user', select: 'username fullName picture -_id' }
                })
                .populate('members.user', 'username fullName picture -_id')
                .populate('createdBy', 'username fullName picture -_id')
                .populate('admin', 'username fullName picture -_id')

            res.status(201).send({ notes });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    getUserNotes: async (req, res) => {
        try {
            const _id = req.user._id;
            const results = await NoteModel.find( { 'members.user': { '$eq': _id, '$exists': true } }
                , { name: 1, description: 1, status: 1, totalCashIn: 1, totalCashOut: 1, totalRemain: 1, created_at: 1, updated_at: 1, 'members.user': 1 })
                .populate('members.user', 'username fullName picture  -_id')
  
            const notes = results.filter(item => item.members.filter(m => m.user).length > 0)
            // notes.forEach(note => {
            //     const transTrackingList = await UserTransTrackingModel.find({ note, user: _id,})
            //     .populate('trans', 'type value -_id')
            // })
            res.status(201).send({ notes });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    updateNote: async (req, res) => {
        try {
            const admin = req.user.id;
            const _id = req.body.id;
            const data = req.body.data;
            const completedNote = await NoteModel.findOne({ _id, status: 'COMPLETED' });
            if (completedNote) {
                throw new NoteCompletedError()
            }
            data.members.forEach(mem => {
                if (mem.isLeft && mem.totalPayment == 0 && mem.totalRemain == 0)
                    mem.deleted = true;
                return mem
            });

            const note = await NoteModel.findOneAndUpdate({ _id, admin }, data, { new: true }, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ status: 500, message: "Error, db request failed" });
                    return
                }
                return

            }).then(note => note.filter(n => n)
                .populate('members.user', 'username fullName picture')
                .populate('admin', 'username fullName picture')
                .execPopulate());

            if (!note) throw new PermissionDeniedError();
            res.status(201).send({ note });
        } catch (err) {
            res.status(404).send(err);
        }
    },

    changeStatus: async (req, res) => {
        try {
            const noteId = req.body.id;
            const note = await NoteModel.findById(noteId);
            if (!note) {
                throw new NoteNotFoundError();
            }

            note.status = req.body.status;
            await note.save()
                .then(n => n.populate('members.user', 'username fullName picture')
                    .populate('admin', 'username fullName picture')
                    .execPopulate());;

            res.status(201).send({ note });
        } catch (err) {
            res.status(404).send(err);
        }
    },

    completeNote: async (req, res) => {
        try {
            const noteId = req.body.id;
            const note = await NoteModel.findById(noteId);
            if (!note) {
                throw new NoteNotFoundError();
            }
            note.members.forEach(async member => {

                const trans = await TransModel.find({
                    note: noteId,
                    deleted: false,
                    'payments.user': member.user
                });
                var totalPayment = 0;
                var totalRemain = 0;
                trans.forEach(t => {
                    const userPayment = t.payments.filter(p => p.user.equals(member.user));
                    if (userPayment[0]) {
                        totalPayment += userPayment[0].payment;
                        totalRemain += userPayment[0].remain;
                    }
                });

                member.totalPayment = totalPayment;
                member.totalRemain = totalRemain;

            })
            note.status = 'COMPLETED'
            await note.save()
                .then(n => n.populate('members.user', 'username fullName picture')
                    .populate('admin', 'username fullName picture')
                    .execPopulate());;

            res.status(201).send({ note });
        } catch (err) {
            res.status(404).send(err);
        }
    }

}