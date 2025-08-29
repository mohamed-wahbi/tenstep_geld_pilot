const mongoose = require('mongoose');
const Joi = require('joi');

const InvoiceSchema = new mongoose.Schema({

    id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    clientName: { type: String, default: "" },
    montantInitial: { type: Number, required: true },
    remise: { type: Number, default: null, min: 0, max: 100 }, // En pourcentage
    montantApresRemise: { type: Number, default: null },
    montantPaye: { type: Number, default: null, min: 0 },
    montantRestant: { type: Number, default: null },
    datePaiementEntreprise: { type: Date, required: true },
    datePaiementClient: { type: Date, default: null },
    statut: { type: String, enum: ['discharged', 'unpaid'], default: 'unpaid' },
    commentairePaiement: { type: String, enum: ['excellent', 'retard'], default: null } // Nouveau champ
},
    { timestamps: true }
);

// Middleware pour calculer les valeurs avant de sauvegarder
InvoiceSchema.pre('save', function (next) {
    this.montantApresRemise = this.montantInitial - (this.montantInitial * (this.remise / 100));
    this.montantRestant = this.montantApresRemise - this.montantPaye;


    // Déterminer le commentaire de paiement
    if (this.datePaiementClient) {
        this.commentairePaiement = this.datePaiementClient <= this.datePaiementEntreprise ? "excellent" : "retard";
    }

    if (this.datePaiementEntreprise < new Date()) {
        this.commentairePaiement = "retard"
    }

    next();
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);

// Validation pour la création d'une facture
function CreateInvoiceValidation(obj) {
    const schema = Joi.object({
        id_client: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        montantInitial: Joi.number().positive().required(),
        remise: Joi.number().min(0).max(100),
        montantPaye: Joi.number().min(0),
        datePaiementEntreprise: Joi.date().required(),
        datePaiementClient: Joi.date().optional(),
        statut: Joi.string().valid('discharged', 'unpaid').default('unpaid'),
    });
    return schema.validate(obj);
}

// Validation pour la mise à jour d'une facture
function UpdateInvoiceValidation(obj) {
    const schema = Joi.object({
        montantInitial: Joi.number().positive(),
        remise: Joi.number().min(0).max(100),
        montantPaye: Joi.number().min(0),
        datePaiementEntreprise: Joi.date(),
        datePaiementClient: Joi.date().optional(),
        statut: Joi.string().valid('discharged', 'unpaid'),
    });
    return schema.validate(obj);
}

module.exports = {
    Invoice,
    CreateInvoiceValidation,
    UpdateInvoiceValidation
};
