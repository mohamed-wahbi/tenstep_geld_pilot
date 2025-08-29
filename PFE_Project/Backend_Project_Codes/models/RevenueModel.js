const mongoose = require('mongoose');


const RevenueSchema = new mongoose.Schema({
    year: { type: String, required: true },
    month: { type: String, required: true },
    id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    nomClient: { type: String, required: true },
    nombreFacturesPayees: { type: Number, default: 0 },
    montantTotalPaye: { type: Number, default: 0 },
    isConfirmed : {type: Boolean, default: false}
}, {
    timestamps: true
});

const Revenue = mongoose.model("Revenue", RevenueSchema);


module.exports = { Revenue };
