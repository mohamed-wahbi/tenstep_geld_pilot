const mongoose = require('mongoose');
const Joi = require('joi');

// Définition du schéma Client
const ClientSchema = new mongoose.Schema({
    cin: { type: String, required: true, unique: true }, // Numéro d'identification unique
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    clientType: { type: String, enum: ["Company", "Individual"], required: true },
    paymentMethod: { 
        type: String, 
        enum: ["Bank Transfer", "Credit Card", "Cash"], 
        required: true 
    },
    currency: { 
        type: String, 
        enum: ["Dinar", "Dollar", "Euro"], 
        required: true 
    },
        status: { 
        type: String, 
        enum: ["Active", "Inactive", "Blocked"], 
        default: "Active" 
    },
    // sharepointId : {
    //     type: String,
    //     default:""
    // }
    idSharepoint: { type: Number, required: true },

},

{
    timestamps: true
}

);

// Export du modèle
const Client = mongoose.model("Client", ClientSchema);

//  Validation pour la création d'un client
function CreateClientValidation(obj) {
    const schema = Joi.object({
        cin: Joi.string().min(6).max(20).required(), // CIN de 6 à 20 caractères
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().pattern(/^\+?\d{8,15}$/).required(), // Format international
        address: Joi.string().min(5).max(100).required(),
        clientType: Joi.string().valid("Company", "Individual").required(),
        paymentMethod: Joi.string().valid("Bank Transfer", "Credit Card", "Cash").required(),
        currency: Joi.string().valid("Dinar", "Dollar", "Euro").required(),
        status: Joi.string().valid("Active", "Inactive", "Blocked")
    }
);

    return schema.validate(obj);
}

//  Validation pour la mise à jour d'un client
function UpdateClientValidation(obj) {
    const schema = Joi.object({
        cin: Joi.string().min(6).max(20), 
        name: Joi.string().min(3).max(50),
        email: Joi.string().email(),
        phone: Joi.string().pattern(/^\+?\d{8,15}$/),
        address: Joi.string().min(5).max(100),
        clientType: Joi.string().valid("Company", "Individual"),
        paymentMethod: Joi.string().valid("Bank Transfer", "Credit Card", "Cash"),
        currency: Joi.string().valid("Dinar", "Dollar", "Euro"),
        status: Joi.string().valid("Active", "Inactive", "Blocked")
    }).min(1); // Assure qu'au moins un champ est mis à jour

    return schema.validate(obj);
}

module.exports = {
    Client,
    CreateClientValidation,
    UpdateClientValidation
};
