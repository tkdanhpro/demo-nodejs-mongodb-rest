const TransModel = require('./transaction.model');
const NoteModel = require('./../note/note.model');
const NoteNotFoundError = require('./../core/error/NoteNotFoundError')

module.exports = {
    addTrans: async (req, res) => {
        try {
            const note = await NoteModel.findById(req.body.data.note);
            if (!note) {
                throw new NoteNotFoundError()
            }

            const data = req.body.data;
            if (data.equal) {
                const numberOfUsers = data.payments.length;
                const amount = data.value / numberOfUsers;
                data.payments.forEach(element => {                    
                    if (element.user == req.user._id) {
                        element.value = data.value - amount*(numberOfUsers-1);
                        element.type = 'CASHBACK'
                    } else {
                        element.value = amount;
                        element.type = 'DEBT'
                    }
                    return element;
                });

            } else {

            }
            data.createdBy = req.user._id;
            const trans = new TransModel(data);
            await trans.save();

            // update note
            if (data.type == 'OUT') {
                note.totalCashOut += data.value;
            } else {
                note.totalCashIn += data.value;
            }
            
            note.transactions = note.transactions.concat(trans._id);
            await note.save();
            res.status(201).send({ trans });

        } catch (err) {
            res.status(404).send(err);
        }
    },

    getTrans: async (params, res) => {

    },

    updateTrans: async (req, res) => {

    }

}