const mongoose = require("mongoose");
const Joi = require("joi");

const monthlyExpenseSchema = new mongoose.Schema({
  month: { type: String, required: true }, // Exemple: "Janvier", "Février"...
  year: { type: Number, required: true },
  expenseId: { type: mongoose.Schema.Types.ObjectId, ref: "ExpenseFix" , default:null},
  expenseName: { type: String, required: true },
  expenseType: {
    type: String,
    enum: ["Payroll", "Admin", "Training", "Marketing", "Travel", "HR", "Other"],
    required: true,
  },
  estimatedAmount: { type: Number, min: 0, default:null },
  actualAmount: { type: Number, min: 0 ,required:true , default:null},
  chargeStatus: {
    type: String,
    enum: ["Charge Normale", "Surcharge", "Not Covred"],
    default: "Charge Normale",
  },
  covredDay : {
    type:String,
    default:null
  },
}, { timestamps: true });

// Mettre à jour automatiquement le statut en fonction des montants
function updateChargeStatus(doc) {
  if (doc.actualAmount > doc.estimatedAmount) {
    doc.chargeStatus = "Surcharge";
  } else {
    doc.chargeStatus = "Charge Normale";
  }
}

monthlyExpenseSchema.pre("save", function(next) {
  updateChargeStatus(this);
  next();
});

monthlyExpenseSchema.pre("findOneAndUpdate", function(next) {
  const update = this.getUpdate();
  if (update.estimatedAmount !== undefined || update.actualAmount !== undefined) {
    updateChargeStatus(update);
  }
  next();
});

const MonthlyExpense = mongoose.model("MonthlyExpense", monthlyExpenseSchema);

// Validation pour la création d'une charge mensuelle
function CreateMonthlyExpenseValidation(obj) {
  const schema = Joi.object({
    month: Joi.string().required(),
    year: Joi.number().required(),
    expenseIds: Joi.array().items(Joi.string()).required(),
    manualExpenses: Joi.array().items(
      Joi.object({
        expenseName: Joi.string().required(),
        expenseType: Joi.string().valid("Payroll", "Admin", "Training", "Marketing", "Travel", "HR", "Other").required(),
        estimatedAmount: Joi.number().min(0).required(),
      })
    ),
  });
  return schema.validate(obj);
}

// Validation pour la mise à jour d'une charge mensuelle
function UpdateMonthlyExpenseValidation(obj) {
  const schema = Joi.object({
    month: Joi.string(),
    year: Joi.number(),
    expenseId: Joi.string(),
    expenseName: Joi.string(),
    expenseType: Joi.string().valid("Payroll", "Admin", "Training", "Marketing", "Travel", "HR", "Other"),
    estimatedAmount: Joi.number().min(0),
    actualAmount: Joi.number().min(0),
  }).min(1);
  return schema.validate(obj);
}

module.exports = {
  MonthlyExpense,
  CreateMonthlyExpenseValidation,
  UpdateMonthlyExpenseValidation
};