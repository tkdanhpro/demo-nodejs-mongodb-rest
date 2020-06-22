const NoteModel = require('./note.model');
const TransModel = require('./../transaction/transaction.model')
const UserNoteDetailModel = require('./../user_note_detail/user_note_detail.model')
const UserTrackingModel = require('./../user_trans_tracking/user_trans_tracking.model')
const PermissionDeniedError = require('../core/error/PermissionDeniedError')
const MembersNoteNotEmptyError = require('../core/error/MembersNoteNotEmptyError')
const NoteNotFoundError = require('../core/error/NoteNotFoundError')
const NoteCompletedError = require('../core/error/NoteCompletedError')

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

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
                .then(n => n.populate('members.user', 'fullName picture')
                    .populate('admin', 'fullName picture')
                    .execPopulate());

            data.members.forEach(member => new UserNoteDetailModel({ note, user: member.user}).save())        
            res.status(201).send({ note });

        } catch (err) {
            res.status(404).send(err);
        }

    },
    getById: async (req, res) => {
        try {
            const note = await NoteModel.findById(req.params.id,
                { name: 1, description: 1, status: 1, totalCashIn: 1, totalCashOut: 1, totalRemain: 1, created_at: 1, updated_at: 1, createdBy: 1, admin: 1 })
                // .populate('members.user', 'fullName picture')
                .populate('createdBy', 'username fullName picture ')
                .populate('admin', 'username fullName picture ');
            
            const members = await UserNoteDetailModel.find({note: note._id})
                .populate('user', 'fullName picture');

            // await asyncForEach(notes, async (note, index, array) => {
            //     const transList = await TransModel.find({ note })
            //     const totalCashOut = transList.map(t => t.value).reduce((a,b) => a + b, 0)
            //     array[index].totalCashOut += totalCashOut
            // })

            res.status(201).send({ note, members });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    getUserNotes: async (req, res) => {
        try {
            const _id = req.user._id;
            var notes = await NoteModel.find({ 'members.user': { '$eq': _id, '$exists': true } }
                , { name: 1, description: 1, status: 1, totalCashIn: 1, totalCashOut: 1, totalRemain: 1, created_at: 1, updated_at: 1, 'members.user': 1, createdBy: 1, admin: 1 })
                .populate('members.user', 'fullName picture')
                .populate('createdBy', 'username fullName picture ')
                .populate('admin', 'username fullName picture ')
                .then(results => results.filter(item => item.members.filter(m => m.user).length > 0))
            
            // var notes = results.filter(item => item.members.filter(m => m.user).length > 0)
            await asyncForEach(notes, async (note, index, array) => {
                const userNote = await UserNoteDetailModel.findOne({note: note._id, user: _id});
                
                array[index].userRemainAmount = userNote.userRemainAmount
            })
            

            res.status(201).send({ notes });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    updateNote: async (req, res) => {
        try {
            const _id = req.body.id;
            const data = req.body.data;
            var note = await NoteModel.findById(_id);
            if (!note) {
                throw new NoteNotFoundError()
            }
            if (note.status == 'COMPLETED') {
                throw new NoteCompletedError()
            }
            console.log("1 data.members ",data.members)
            await asyncForEach(data.members, async (mem, index, array) => {                
                if (mem.isNewMember) {
                    note.members.push({
                        user: mem.user,
                        isLeft: false,
                        totalPayment: 0,
                        totalRemain: 0,
                        deleted: false
                    })
                    await new UserNoteDetailModel({ note: _id, user: mem.user}).save()
                }
                if (mem.isLeft) {
                    const noteDetails = await UserNoteDetailModel.findOne({note: _id, user: mem.user})
                    console.log("noteDetails ",noteDetails)
                    if (noteDetails == null)
                        throw new NoteNotFoundError();
                    if (noteDetails.userRemainAmount > 0 || noteDetails.userPaymentAmount > 0 || noteDetails.userPaidAmount > 0) {
                        throw new PermissionDeniedError("Cannot kick this user because they joined transaction!");
                    }

                    noteDetails.isLeft=true;
                    await noteDetails.save();
                    note.members = note.members.filter(m => !m.user.equals(mem.user))

                }
                return mem
            });
            console.log("2 note.members ",note.members)
            note.admin = data.admin;
            note.status = data.status;
            // note.members = data.members;
            note.name = data.name;
            note.description = data.description;
            await note.save()    
                .then(note => note.populate('members.user', 'username fullName picture')
                    .populate('admin', 'username fullName picture')
                    .execPopulate());
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

            if (!req.user._id.equals(note.admin)) {
                throw new PermissionDeniedError();
            }

            note.status = req.body.status;
            await note.save();
                // .then(n => n.populate('members.user', 'fullName picture')
                //     .populate('admin', 'fullName picture')
                //     .execPopulate());

            // res.status(201).send({ note: note._id, status: note.status });
            res.status(201).send({ status: note.status});
        } catch (err) {
            res.status(404).send(err);
        }
    },

    shareMoney: async (req, res) => {
        try {
            const noteId = req.params.id;
            
            const note = await NoteModel.findById(noteId, { name: 1, description: 1, status: 1, totalCashIn: 1, totalCashOut: 1, totalRemain: 1, created_at: 1, updated_at: 1, createdBy: 1, admin: 1 });
            if (!note) {
                throw new NoteNotFoundError();
            }
            note.status = 'COMPLETED';
            await note.save();
            // console.log(note._id )
            const members = await UserNoteDetailModel.find({ note: note._id })
            .populate('user', 'fullName picture');
            res.status(201).send({ note, members });
        } catch (err) {
            res.status(404).send(err);
        }
    },


    deleteNote: async (req, res) => {
        try {
            const _id = req.body.id;
            var note = await NoteModel.findById( _id );
            if (!note) {
                throw new NoteNotFoundError()
            }
            note.status = 'CLOSED';
            await note.save();

            res.status(201).send({ deleted: true });
        } catch (err) {
            res.status(404).send(err);
        }
    },

    changeAdmin: async (req, res) => {
        try {
            const noteId = req.body.id;
            const admin = req.body.admin;
            const note = await NoteModel.findById(noteId);
            if (!note) {
                throw new NoteNotFoundError();
            }

            if (!req.user._id.equals(note.admin)) {
                throw new PermissionDeniedError();
            }

            note.admin = admin;
            await note.save()
            .then(note => note
                .populate('members.user', 'username fullName picture')
                .populate('admin', 'username fullName picture')
                .execPopulate());

            res.status(201).send(note);
        } catch (err) {
            res.status(404).send(err);
        }
    },

    left: async (req, res) => {
        try {
            const noteId = req.body.id;
            const userId = req.user._id;
            const note = await NoteModel.findById(noteId);
            if (!note) {
                throw new NoteNotFoundError();
            }

            const noteDetails = await UserNoteDetailModel.findOne({note: noteId, user: userId})
            if (noteDetails == null)
                throw new NoteNotFoundError();
            if (noteDetails.userRemainAmount > 0 || noteDetails.userPaymentAmount > 0 || noteDetails.userPaidAmount > 0) {
                throw new PermissionDeniedError("You cannot leave because you created transaction!");
            }

            noteDetails.isLeft=true;
            await noteDetails.save();

            res.status(201).send({ note: noteId, user: userId, isLeft: true});
        } catch (err) {
            res.status(404).send(err);
        }
    },

    kick: async (req, res) => {
        try {
            const noteId = req.body.id;
            const userId = req.body.user;
            const admin = req.user._id;
            const note = await NoteModel.findById(noteId);
            if (!note) {
                throw new NoteNotFoundError();
            }

            if (!admin.equals(note.admin)) {
                throw new PermissionDeniedError();
            }
            const noteDetails = await UserNoteDetailModel.findOne({note: noteId, user: userId})
            if (noteDetails == null)
                throw new NoteNotFoundError();
            if (noteDetails.userRemainAmount > 0 || noteDetails.userPaymentAmount > 0 || noteDetails.userPaidAmount > 0) {
                throw new PermissionDeniedError("This user cannot leave because they created transaction!");
            }

            noteDetails.isLeft=true;
            await noteDetails.save();

            res.status(201).send({ note: noteId, user: userId, isLeft: true});
        } catch (err) {
            res.status(404).send(err);
        }
    }
}