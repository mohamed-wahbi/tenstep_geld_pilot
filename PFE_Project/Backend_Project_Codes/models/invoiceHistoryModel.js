const mongoose = require('mongoose');

const InvoiceHistorySchema = new mongoose.Schema({
    id_invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    clientName: { type: String, required: true },
    montantInitial: { type: Number, required: true },
    remise: { type: Number, required: true },
    montantApresRemise: { type: Number, required: true },
    montantPaye: { type: Number, required: true },
    datePaiementEntreprise: { type: Date, required: true },
    datePaiementClient: { type: Date, required: true },
    statut: { type: String, enum: ['discharged'], required: true },
    commentairePaiement: { type: String, enum: ['excellent', 'retard']}
}, {
    timestamps: true
});

const InvoiceHistory = mongoose.model("InvoiceHistory", InvoiceHistorySchema);

module.exports = { InvoiceHistory };
