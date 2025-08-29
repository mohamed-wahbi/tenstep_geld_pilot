const mongoose = require("mongoose");
const Joi = require('joi');

const expenseFixSchema = new mongoose.Schema({

    idSharepoint: { type: Number, required: true },
    expenseName: { type: String, required: true },
    expenseType: {
        type: String,
        enum: ["Payroll", "Admin", "Training", "Marketing", "Travel", "HR", "Other"],
        required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ["Fixed", "Variable"],
        required: true,
    },
    paymentDay: { type: Number, min: 1, max: 31, required: true }


}, { timestamps: true });

const ExpenseFix = mongoose.model("ExpenseFix", expenseFixSchema);

// Validation pour la création d'une dépense fixe
function CreateExpenseFixValidation(obj) {
    const schema = Joi.object({
        expenseName: Joi.string().required(),
        expenseType: Joi.string()
            .valid("Payroll", "Admin", "Training", "Marketing", "Travel", "HR", "Other")
            .required(),
        amount: Joi.number().min(0).required(),
        status: Joi.string().valid("Fixed", "Variable").required(),
        paymentDay: Joi.number().integer().min(1).max(31).required(),
    });

    return schema.validate(obj);
}

// Validation pour la mise à jour d'une dépense fixe
function UpdateExpenseFixValidation(obj) {
    const schema = Joi.object({
        expenseName: Joi.string(),
        expenseType: Joi.string().valid("Payroll", "Admin", "Training", "Marketing", "Travel", "HR", "Other"),
        amount: Joi.number().min(0),
        status: Joi.string().valid("Fixed", "Variable"),
        paymentDay: Joi.number().integer().min(1).max(31),
    }).min(1); // Assure qu'au moins un champ est mis à jour

    return schema.validate(obj);
}
module.exports = {
    ExpenseFix,
    CreateExpenseFixValidation,
    UpdateExpenseFixValidation
};




