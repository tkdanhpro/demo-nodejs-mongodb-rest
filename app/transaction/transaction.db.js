const TransModel = require('./transaction.model')
const NoteModel = require('./../note/note.model')
const UserTransTrackingModel = require('../user_trans_tracking/user_trans_tracking.model')
const UserNoteDetailModel = require('../user_note_detail/user_note_detail.model')
const NoteNotFoundError = require('./../core/error/NoteNotFoundError')
const UserNotFoundError = require('./../core/error/UserNotFoundError')
const TransNotFoundError = require('./../core/error/TransNotFoundError')
const InvalidParamsError = require('./../core/error/InvalidParamsError')
const asyncForEach = require('./../core/common/common')

module.exports = {
    addTrans: async (req, res) => {
        try {
            var note = await NoteModel.findById(req.body.data.note);
            if (!note) {
                throw new NoteNotFoundError()
            }
            

            const data = req.body.data;
            data.createdBy = req.user._id;
            data.payer = req.user._id;
            console.log("Data trans ", data)
            // update note
            if (data.type == 'OUT') note.totalCashOut += data.value;
            if (data.type == 'IN') note.totalCashIn += data.value;
            note = await note.save();

            // check if payments contains payer or not
            const isIncludedPayer = data.payments.filter(p => p.user == data.payer).length > 0;
            if (!isIncludedPayer) {
                data.payments.push({
                    user: data.payer,
                    amount: 0
                })
            }

            // set data for transactions
            const users = data.payments.map(payment => payment.user);
            data.users = users;

            const trans = new TransModel(data);
            await trans.save()
                .then(t => {
                        // t.filter({ title: 1, description: 1, status: 1, type: 1, payer: 1, createdBy: 1, created_at: 1, updated_at: 1 })
                        t.populate('payer', 'fullName picture')
                        .populate('users', 'fullName picture')
                        .populate('createdBy', 'fullName picture')
                        .execPopulate()
                });

            // add user trans tracking
            var userPayment = 0;
            var payerNoteDetail = {};
            var userTransTrackingList = [];
            await asyncForEach(data.payments, async (payment, index, array) => {            
                var trackingData = {
                    user: payment.user,
                    note,
                    trans,
                    payment: payment.amount
                }
                if (payment.user == data.payer) {
                    userPayment += trackingData.payment;
                    trackingData.type = 'CASHBACK';
                    trackingData.remain = data.value - trackingData.payment;
                    trans.remainAmount = trackingData.remain
                } else {
                    trackingData.type = 'DEBT';
                    trackingData.remain = - trackingData.payment;
                }
                userTransTrackingList.push(new UserTransTrackingModel(trackingData))

                // update user's note detail
                var userNoteDetail = await UserNoteDetailModel.findOne({note : note._id, user: payment.user});

                if (!userNoteDetail) {
                    throw new UserNotFoundError("User's note not found!")
                }
                
                userNoteDetail.userRemainAmount += trackingData.remain;
                userNoteDetail.userPaymentAmount += trackingData.payment;
                userNoteDetail.userPaidAmount = userNoteDetail.userRemainAmount + userNoteDetail.userPaymentAmount;
                userNoteDetail = await userNoteDetail.save(); 
                if (payment.user == data.payer) payerNoteDetail = userNoteDetail
        
            });
            
            UserTransTrackingModel.insertMany(userTransTrackingList);

            const userRemainAmount = payerNoteDetail.userRemainAmount;
            const userPaymentAmount = payerNoteDetail.userPaymentAmount;
            const userPaidAmount = payerNoteDetail.userPaidAmount;

            res.status(201).send({ trans, userRemainAmount, userPaymentAmount, userPaidAmount, totalCashOut: note.totalCashOut });

        } catch (err) {
            res.status(404).send(err);
        }
    },

    updateTrans: async (req, res) => {
        try {
            const data = req.body.data;
            data.createdBy = req.user._id;
            data.payer = req.user._id;
            const transId = data._id

            const oldTrans = await TransModel.findById(transId);
            if (!oldTrans) {
                throw new TransNotFoundError()
            }
            var note = await NoteModel.findById(data.note);
            if (!note) {
                throw new NoteNotFoundError()
            }

            // check if payments contains payer or not
            const isIncludedPayer = data.payments.filter(p => p.user == data.payer).length > 0;
            if (!isIncludedPayer) {
                data.payments.push({
                    user: data.payer,
                    amount: 0
                })
            }

            // set data for new transactions
            const users = data.payments.map(payment => payment.user);
            data.users = users;
            const trans = await TransModel.findByIdAndUpdate({ _id: transId }, data, {new: true})
                    .populate('users', 'fullName picture')
                    .populate('payer', 'fullName picture')
                    .populate('createdBy', 'fullName picture');
            // delete previous tracking list
            const previousTrackings = await UserTransTrackingModel.find({note: note._id, trans: transId})
            UserTransTrackingModel.deleteMany({note: note._id, trans: transId})
            .then(result => console.log(`Deleted ${result.deletedCount} item(s).`))
            .catch(err => console.error(`Delete failed with error: ${err}`))

            // var paymentUsers = data.payments.map(p => p.user);
            // console.log("paymentUsers ", paymentUsers);
            
            // var removedUsersTracking = previousTrackings.filter(tracking =>  !paymentUsers.includes(tracking.user));
            // console.log("removedUsersTracking ", removedUsersTracking);
            // if (removedUsersTracking.length > 0) {
            //     await asyncForEach(removedUsersTracking, async (tracking, index, array) => {
            //         console.log("tracking ", tracking);
            //         var userNoteDetail = await UserNoteDetailModel.findOne({note: note._id, user: tracking.user});                   
            //         console.log("userNoteDetail ", userNoteDetail);
            //         userNoteDetail.userRemainAmount -= tracking.remain;
            //         userNoteDetail.userPaymentAmount -= tracking.payment;
            //         userNoteDetail.userPaidAmount = userNoteDetail.userRemainAmount + userNoteDetail.userPaymentAmount;

            //         userNoteDetail = await userNoteDetail.save(); 
                    
            //     })
            // }
            

            // add new user trans tracking
            var userPayment = 0;
            var payerNoteDetail = {};
            var userTransTrackingList = [];
            await asyncForEach(data.payments, async (payment, index, array) => {       
                var trackingData = {
                    user: payment.user,
                    note,
                    trans,
                    payment: payment.amount
                }
                if (payment.user == data.payer) {
                    userPayment += trackingData.payment;
                    trackingData.type = 'CASHBACK';
                    trackingData.remain = data.value - trackingData.payment;
                    trans.remainAmount = trackingData.remain
                } else {
                    trackingData.type = 'DEBT';
                    trackingData.remain = - trackingData.payment;
                }
                userTransTrackingList.push(new UserTransTrackingModel(trackingData))

                // update user's note detail
                var userNoteDetail = await UserNoteDetailModel.findOne({note: note._id, user: payment.user});
                if (!userNoteDetail) {
                    throw new NoteNotFoundError("User's note not found!")
                }                
                
                var oldValues = previousTrackings.filter(tracking =>  tracking.user.equals(payment.user));
                if (oldValues.length < 1)
                    oldValues.push({payment: 0, remain: 0, user: payment.user})
                // if (trackingData.user.equals(oldValues[0].user)) {

                // } else {

                // }
                userNoteDetail.userRemainAmount += trackingData.remain - oldValues[0].remain;
                userNoteDetail.userPaymentAmount += trackingData.payment - oldValues[0].payment;
                userNoteDetail.userPaidAmount = userNoteDetail.userRemainAmount + userNoteDetail.userPaymentAmount;

                userNoteDetail = await userNoteDetail.save(); 
                if (payment.user == data.payer) payerNoteDetail = userNoteDetail

            });

            UserTransTrackingModel.insertMany(userTransTrackingList);
            var totalCashOut = note.totalCashOut - oldTrans.value + data.value;
            note.totalCashOut = totalCashOut;
            note.save();

            const userRemainAmount = payerNoteDetail.userRemainAmount;
            const userPaymentAmount = payerNoteDetail.userPaymentAmount;
            const userPaidAmount = payerNoteDetail.userPaidAmount;
            res.status(201).send({ trans, userRemainAmount, userPaymentAmount, userPaidAmount, totalCashOut });

        } catch (err) {
            res.status(404).send(err);
        }
    },

    deleteTrans: async (req, res) => {
        try {
            const transId = req.params.transId

            var trans = await TransModel.findById(transId);
            if (!trans) {
                throw new TransNotFoundError()
            }
            if (trans.deleted) {
                throw new InvalidParamsError("Transaction deleted already!")
            }
            
            trans.deleted = true;
            trans.save();
            const note = trans.note;
            // delete previous tracking list
            //const previousTrackings = await UserTransTrackingModel.find({note: note._id, trans: transId})
            // UserTransTrackingModel.deleteMany({note: note._id, trans: transId})
            // .then(result => console.log(`Deleted ${result.deletedCount} item(s).`))
            // .catch(err => console.error(`Delete failed with error: ${err}`))

            await UserTransTrackingModel.updateMany({note: note._id, trans: transId}, {"$set":{ deleted: true}})

            var userNoteDetails = await UserNoteDetailModel.find({note});
            const _userId = req.user._id;
            var payerNoteDetail = {};
            await asyncForEach(userNoteDetails, async (userDetail, index, array) => {
                const userTrackings = await UserTransTrackingModel.find({note: note._id, user: userDetail.user._id, deleted: false});
                var userRemainAmount = 0;
                var userPaymentAmount = 0;
                var userPaidAmount = 0;
                if (userTrackings) {
                    userRemainAmount    += userTrackings.map(t => t.remain).reduce((a,b) => a + b, 0);                    
                    userPaymentAmount   += userTrackings.map(t => t.payment).reduce((a,b) => a + b, 0);
                    // userPaidAmount      += userTrackings.map(t => t.userPaidAmount).reduce((a,b) => a + b, 0);
                    userPaidAmount = userPaymentAmount + userRemainAmount;
                }
                
                array[index].userRemainAmount = userRemainAmount;
                array[index].userPaymentAmount = userPaymentAmount;
                array[index].userPaidAmount = userPaidAmount;
                if (_userId.equals(userDetail.user)) {
                    payerNoteDetail = array[index]
                }
                userDetail.save()

            })
            var updateNote = await NoteModel.findById(note._id);
            updateNote.totalCashOut -= trans.value;
            updateNote.save();
            var totalCashOut = updateNote.totalCashOut;     

            const userRemainAmount = payerNoteDetail.userRemainAmount;
            const userPaymentAmount = payerNoteDetail.userPaymentAmount;
            const userPaidAmount = payerNoteDetail.userPaidAmount;
            res.status(201).send({ trans : {_id: trans._id, deleted: true, note: trans.note}, userRemainAmount, userPaymentAmount, userPaidAmount, totalCashOut });

        } catch (err) {
            res.status(404).send(err);
        }
    },

    undoTrans: async (req, res) => {
        try {
            const transId = req.params.transId

            var trans = await TransModel.findById(transId);
            if (!trans) {
                throw new TransNotFoundError()
            }
            if (!trans.deleted) {
                throw new InvalidParamsError("Transaction un-deleted already!")
            }
            trans.deleted = false;
            trans.save();
            const note = trans.note;

            await UserTransTrackingModel.updateMany({note: note._id, trans: transId}, {"$set":{"deleted": false}})

            var userNoteDetails = await UserNoteDetailModel.find({note});
            const _userId = req.user._id;
            var payerNoteDetail = {};
            await asyncForEach(userNoteDetails, async (userDetail, index, array) => {
                const userTrackings = await UserTransTrackingModel.find({note: note._id, user: userDetail.user._id, deleted: false});
                var userRemainAmount = 0;
                var userPaymentAmount = 0;
                var userPaidAmount = 0;
                if (userTrackings) {
                    userRemainAmount    += userTrackings.map(t => t.remain).reduce((a,b) => a + b, 0);                    
                    userPaymentAmount   += userTrackings.map(t => t.payment).reduce((a,b) => a + b, 0);
                    // userPaidAmount      += userTrackings.map(t => t.userPaidAmount).reduce((a,b) => a + b, 0);
                    userPaidAmount = userPaymentAmount + userRemainAmount;
                }
                array[index].userRemainAmount = userRemainAmount;
                array[index].userPaymentAmount = userPaymentAmount;
                array[index].userPaidAmount = userPaidAmount;
                if (_userId.equals(userDetail.user)) {
                    payerNoteDetail = array[index]
                }
                userDetail.save()

            })
            var updateNote = await NoteModel.findById(note._id);
            updateNote.totalCashOut += trans.value;
            updateNote.save();
            var totalCashOut = updateNote.totalCashOut;     

            const userRemainAmount = payerNoteDetail.userRemainAmount;
            const userPaymentAmount = payerNoteDetail.userPaymentAmount;
            const userPaidAmount = payerNoteDetail.userPaidAmount;
            res.status(201).send({ trans : {_id: trans._id, deleted: false, note: trans.note}, userRemainAmount, userPaymentAmount, userPaidAmount, totalCashOut });

        } catch (err) {
            res.status(404).send(err);
        }
    },

    getById: async (req, res) => {
        try {
            const id = req.params.id;
            const trans = await TransModel.findById(id,
                { title: 1, description: 1, value: 1, status: 1, type: 1, payer: 1, createdBy: 1, created_at: 1, updated_at: 1 })
                .populate('payer', 'fullName picture')
                .populate('createdBy', 'fullName picture');
            if (!trans) {
                throw new TransNotFoundError()
            }
            const trackings = await UserTransTrackingModel.find({ trans: id})
                .populate('user', 'fullName picture')

            res.status(201).send({ trans, trackings })
        } catch (err) {
            res.status(404).send(err);
        }
    },

    getByNote: async (req, res) => {
        try {
            const noteId = req.params.noteId;

            var trans = await TransModel.find({ note : noteId})
                .populate('users', 'fullName picture')
                .populate('payer', 'fullName picture')
                .populate('createdBy', 'fullName picture');

            if (!trans) {
                throw new TransNotFoundError()
            }
            
            
            const userTrackings = await UserTransTrackingModel.find({ note : noteId, user: req.user._id  })
            
            // await asyncForEach(trans, async (tran, index, array) => {
            trans.forEach((tran, index, array) => {
                const item = userTrackings.filter(tracking => tracking.trans.equals(tran._id))
                if (item.length > 0 && !item[0].deleted) {
                    array[index].remainAmount += item[0].remain
                }
                
            })

            const note = await NoteModel.findById(noteId)
            var userRemainAmount = 0;
            var userPaymentAmount = 0;
            userTrackings.forEach(tracking => {
                userRemainAmount += tracking.remain;
                userPaymentAmount += tracking.payment
            })
            var userPaidAmount = userRemainAmount + userPaymentAmount;

            res.status(201).send({ trans, userRemainAmount, userPaymentAmount, userPaidAmount, totalCashOut: note.totalCashOut })
        } catch (err) {
            res.status(404).send(err);
        }
    }

}
