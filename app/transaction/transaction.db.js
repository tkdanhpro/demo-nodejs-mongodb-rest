const TransModel = require('./transaction.model')
const NoteModel = require('./../note/note.model')
const UserTransTrackingModel = require('../user_trans_tracking/user_trans_tracking.model')
const UserNoteDetailModel = require('../user_note_detail/user_note_detail.model')
const NoteNotFoundError = require('./../core/error/NoteNotFoundError')
const TransNotFoundError = require('./../core/error/TransNotFoundError')
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
            // })
            // data.payments.forEach(payment => {
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
                var userNoteDetail = await UserNoteDetailModel.findOne({note, user: payment.user});
                if (!userNoteDetail) {
                    throw new NoteNotFoundError("User's note not found!")
                }
                
                userNoteDetail.userRemainAmount += trackingData.remain;
                userNoteDetail.userPaymentAmount += trackingData.payment;
                userNoteDetail.userPaidAmount = userNoteDetail.userRemainAmount + userNoteDetail.userPaymentAmount;
                userNoteDetail = await userNoteDetail.save(); 
                if (payment.user == data.payer) payerNoteDetail = userNoteDetail
        
            });
            console.log("payerNoteDetail ", payerNoteDetail)

            await UserTransTrackingModel.insertMany(userTransTrackingList);
            var totalPayment = note.totalCashOut + trans.value;
            
            // var userNoteDetail = await UserNoteDetailModel.findOne({note, user: req.user});
            // if (!userNoteDetail) throw new NoteNotFoundError("User's note not found!")
            // userNoteDetail.userRemainAmount += (trans.value - userPayment);
            // userNoteDetail.userPaymentAmount += userPayment;
            // userNoteDetail = await userNoteDetail.save();            

            const userRemainAmount = payerNoteDetail.userRemainAmount;
            const userPaymentAmount = payerNoteDetail.userPaymentAmount;
            const userPaidAmount = payerNoteDetail.userPaidAmount;

            res.status(201).send({ trans, userRemainAmount, userPaymentAmount, userPaidAmount, totalPayment });

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

            const ts = await TransModel.findById(transId);
            if (!ts) {
                throw new TransNotFoundError()
            }
            const note = await NoteModel.findById(data.note);
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

            // set data for transactions
            const users = data.payments.map(payment => payment.user);
            data.users = users;
            const trans = await TransModel.findByIdAndUpdate({ _id: transId }, data, { new: true })
                    .populate('users', 'fullName picture')
                    .populate('payer', 'fullName picture')
                    .populate('createdBy', 'fullName picture');

            // delete previous tracking list
            await UserTransTrackingModel.deleteMany({note: note._id, trans: transId})

            // add user trans tracking
            var userTransTrackingList = [];

            data.payments.forEach(payment => {
                var trackingData = {
                    user: payment.user,
                    note,
                    trans,
                    payment: payment.amount
                }
                if (payment.user == data.payer) {
                    trackingData.type = 'CASHBACK';
                    trackingData.remain = data.value - trackingData.payment;
                } else {
                    trackingData.type = 'DEBT';
                    trackingData.remain = - trackingData.payment;
                }
                userTransTrackingList.push(new UserTransTrackingModel(trackingData))

            });

            await UserTransTrackingModel.insertMany(userTransTrackingList);

            // res.status(201).send({ trans });
            var totalPayment = 0;
            
            const userTrackings = await UserTransTrackingModel.find({ note, user: req.user })
            // await asyncForEach(trans, async (tran, index, array) => {
            trans.forEach(tran => totalPayment += tran.value)
            console.log(trans)
            var userRemainAmount = 0;
            var userPaymentAmount = 0;
            userTrackings.forEach(tracking => {
                userRemainAmount += tracking.remain;
                userPaymentAmount += tracking.payment
            })
            var userPaidAmount = userRemainAmount + userPaymentAmount;
            res.status(201).send({ trans, userRemainAmount, userPaymentAmount, userPaidAmount, totalPayment });

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
            const trackings = await UserTransTrackingModel.find({ trans: id })
                .populate('user', 'fullName picture')

            res.status(201).send({ trans, trackings })
        } catch (err) {
            res.status(404).send(err);
        }
    },

    getByNote: async (req, res) => {
        try {
            const note = req.params.noteId;

            var trans = await TransModel.find({ note })
                .populate('users', 'fullName picture')
                .populate('payer', 'fullName picture')
                .populate('createdBy', 'fullName picture');

            if (!trans) {
                throw new TransNotFoundError()
            }
            var totalPayment = 0;
            
            const userTrackings = await UserTransTrackingModel.find({ note, user: req.user })
            // await asyncForEach(trans, async (tran, index, array) => {
            trans.forEach((tran, index, array) => {
                totalPayment += tran.value;
                
                const item = userTrackings.filter(tracking => tracking.trans.equals(tran._id))
                if (item.length > 0) {
                    array[index].remainAmount += item[0].remain
                }
                
            })
            
            var userRemainAmount = 0;
            var userPaymentAmount = 0;
            userTrackings.forEach(tracking => {
                userRemainAmount += tracking.remain;
                userPaymentAmount += tracking.payment
            })
            var userPaidAmount = userRemainAmount + userPaymentAmount;

            res.status(201).send({ trans, userRemainAmount, userPaymentAmount, userPaidAmount, totalPayment })
        } catch (err) {
            res.status(404).send(err);
        }
    }

}
