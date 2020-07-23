const NoteModel = require('./note.model');
const UserNoteDetailModel = require('./../user_note_detail/user_note_detail.model')
const PermissionDeniedError = require('../core/error/PermissionDeniedError')
const MembersNoteNotEmptyError = require('../core/error/MembersNoteNotEmptyError')
const NoteNotFoundError = require('../core/error/NoteNotFoundError')
const NoteCompletedError = require('../core/error/NoteCompletedError')

const { notesCollectionRef, userNoteDetailsCollectionRef, usersCollectionRef, db } = require('../../config/db')
const { convertTimeStampToDate, getData } = require('../core/common/common')
const { asyncForEach } = require('./../core/common/common')
const { v4: uuidv4 } = require('uuid');

module.exports = {
    addNote: async (req, res) => {
        try {
            const user = req.user;
            const note = req.body.data;
            if (!note.members.length) {
                throw new MembersNoteNotEmptyError();
            }
            let { id, fullName, picture } = (await usersCollectionRef.doc(user.id).get()).data()

            note.createdBy = { id, fullName, picture };
            note.admin = { id, fullName, picture };
            note.members = note.members.concat({ user: user.id });
            note.totalCashIn = 0;
            note.totalCashOut = 0;
            note.totalRemain = 0;
            note.created_at = new Date();
            note.updated_at = new Date();

            // generate note id
            const noteId = uuidv4();
            note.id = noteId
            console.log('note data ', note)
            await notesCollectionRef.doc(noteId).set(note)            
            
            // const note = new NoteModel(noteData);
            // await note.save()
            //     .then(n => n.populate('members.user', 'fullName picture')
            //         .populate('admin', 'fullName picture')
            //         .execPopulate());

            await asyncForEach(note.members, async (member, index, array) => {
                let userDetail = (await usersCollectionRef.doc(member.user).get()).data()
                let { id, fullName, picture } = userDetail;
                await db.collection('members').doc

                const userNoteDetailId = uuidv4();
                let userNoteDetail = {
                    id: userNoteDetailId,
                    user: { id, fullName, picture },
                    noteId,
                    deleted: false,
                    isLeft: false,
                    userRemainAmount: 0,
                    userPaymentAmount: 0,
                    userPaidAmount: 0,
                    created_at: new Date(),
                    updated_at: new Date()
                }

                console.log('userNoteDetail data ', userNoteDetail)
               
                array[index].id = userNoteDetailId;
                array[index].user = userNoteDetail.user;
                array[index].isLeft = userNoteDetail.isLeft;
                array[index].userRemainAmount = 0;
                array[index].userPaymentAmount = 0;
                array[index].userPaidAmount = 0;

                console.log('member ', member);

                userNoteDetailsCollectionRef.doc(userNoteDetailId).set(userNoteDetail);
            });

            console.log('note.members data ', note.members)
            res.status(201).send({ note });

        } catch (err) {
            res.status(404).send(err);
        }

    },
    getById: async (req, res) => {
        try {
            const noteId = req.params.id;
            const note = (await notesCollectionRef.doc(noteId).get()).data()
            // const admin = (await usersCollectionRef.doc(note.admin).get()).data()
            // const createdBy = note.admin === note.createdBy ? admin : (await usersCollectionRef.doc(note.createdBy).get()).data();

            // note.admin = { id: admin.id, fullName: admin.fullName, picture: admin.picture };
            // note.createdBy = { id: createdBy.id, fullName: createdBy.fullName, picture: createdBy.picture };

            // const note = await NoteModel.findById(req.params.id,
            //     { name: 1, description: 1, status: 1, totalCashIn: 1, totalCashOut: 1, totalRemain: 1, created_at: 1, updated_at: 1, createdBy: 1, admin: 1 })
            //     // .populate('members.user', 'fullName picture')
            //     .populate('createdBy', 'username fullName picture ')
            //     .populate('admin', 'username fullName picture ');

            let members = [];
            const snap = await userNoteDetailsCollectionRef
            .where('noteId', '==', noteId)
            .where('isLeft', '==', false)
            .get();


            console.log(snap.empty)
            await userNoteDetailsCollectionRef
                .where('noteId', '==', noteId)
                .where('isLeft', '==', false)
                .get()
                .then(result => {
                    result.forEach(docSnapshot => {
                        let item = docSnapshot.data();
                        convertTimeStampToDate(item)
                        members.push(item)
                    });

                });
            convertTimeStampToDate(note)
            note.members = members

            console.log('note detail => ', note)

            // const members = await UserNoteDetailModel.find({ note: note._id, isLeft: false })
            //     .populate('user', 'fullName picture');

            // await asyncForEach(notes, async (note, index, array) => {
            //     const transList = await TransModel.find({ note })
            //     const totalCashOut = transList.map(t => t.value).reduce((a,b) => a + b, 0)
            //     array[index].totalCashOut += totalCashOut
            // })

            res.status(201).send({ note });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    getUserNotes: async (req, res) => {
        try {
            const userId = req.user.id;
            console.log('userId => ', userId)
            let notes = [];
            await notesCollectionRef.where('members.user', '==', userId).get()
            .then(result => {
                result.forEach(docSnapshot => {
                    let item = docSnapshot.data();
                    console.log('item => ', item)
                    convertTimeStampToDate(item)
                    notes.push(item)
                });

            });

            // var notes = await NoteModel.find({ 'members.user': { '$eq': _id, '$exists': true } }
            //     , { name: 1, description: 1, status: 1, totalCashIn: 1, totalCashOut: 1, totalRemain: 1, created_at: 1, updated_at: 1, 'members.user': 1, createdBy: 1, admin: 1 })
            //     .populate('members.user', 'fullName picture')
            //     .populate('createdBy', 'username fullName picture ')
            //     .populate('admin', 'username fullName picture ')
            //     .then(results => results.filter(item => item.members.filter(m => m.user).length > 0))

            // var notes = results.filter(item => item.members.filter(m => m.user).length > 0)
            // let results = [];
            // await asyncForEach(notes, async (note, index, array) => {
            //     const userNote = await UserNoteDetailModel.findOne({ note: note._id, user: _id, isLeft: false });
            //     if (userNote) {
            //         array[index].userRemainAmount = userNote.userRemainAmount
            //         results.push(note)
            //     }
            // })


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
            console.log("1 data ", data)
            await asyncForEach(data.members, async (mem, index, array) => {
                if (mem.isNewMember) {
                    note.members.push({
                        user: mem.user,
                        isLeft: false,
                        totalPayment: 0,
                        totalRemain: 0,
                        deleted: false
                    })
                    await new UserNoteDetailModel({ note: _id, user: mem.user }).save()
                }
                if (mem.isLeft) {
                    const noteDetails = await UserNoteDetailModel.findOne({ note: _id, user: mem.user })
                    // console.log("noteDetails ",noteDetails)
                    if (noteDetails == null)
                        throw new NoteNotFoundError();
                    if (noteDetails.userRemainAmount > 0 || noteDetails.userPaymentAmount > 0 || noteDetails.userPaidAmount > 0) {
                        throw new PermissionDeniedError("Cannot kick this user because they joined transaction!");
                    }

                    noteDetails.isLeft = true;
                    await noteDetails.save();
                    note.members = note.members.filter(m => !m.user.equals(mem.user))

                }
                return mem
            });
            if (data.admin) {
                note.admin = data.admin;
            }
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
            res.status(201).send({ status: note.status });
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
            var note = await NoteModel.findById(_id);
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

            console.log(note)
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

            const noteDetails = await UserNoteDetailModel.findOne({ note: noteId, user: userId })
            if (noteDetails == null)
                throw new NoteNotFoundError();
            if (noteDetails.userRemainAmount > 0 || noteDetails.userPaymentAmount > 0 || noteDetails.userPaidAmount > 0) {
                throw new PermissionDeniedError("You cannot leave because you created transaction!");
            }

            noteDetails.isLeft = true;
            await noteDetails.save();

            res.status(201).send({ note: noteId, user: userId, isLeft: true });
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
            const noteDetails = await UserNoteDetailModel.findOne({ note: noteId, user: userId })
            if (noteDetails == null)
                throw new NoteNotFoundError();
            if (noteDetails.userRemainAmount > 0 || noteDetails.userPaymentAmount > 0 || noteDetails.userPaidAmount > 0) {
                throw new PermissionDeniedError("This user cannot leave because they created transaction!");
            }

            noteDetails.isLeft = true;
            await noteDetails.save();

            res.status(201).send({ note: noteId, user: userId, isLeft: true });
        } catch (err) {
            res.status(404).send(err);
        }
    }
}