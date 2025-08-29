const mongoose = require("mongoose");
const Joi = require("joi");

const MonthlyFinancialActivitiesSchema = new mongoose.Schema(
  {
    year: { type: String, required: true }, // Année
    month: { type: String, required: true }, // Mois
    bankFund: { type: Number, required: true }, // Fonds bancaires

    // Liste des revenus et calcul du total des revenus
    totalRevenue: { type: Number, default: 0 },
    revenuesList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Revenue" }],

    // Liste des dépenses et calcul du total des dépenses
    totalExpenses: { type: Number, default: 0 },
    expensesList: [{ type: mongoose.Schema.Types.ObjectId, ref: "MonthlyExpenseResult" }],

    // Reste = totalRevenue - totalExpenses
    rest: { type: Number, default: 0 },

    // Reste global = (totalRevenue - totalExpenses) + bankFund
    globalRest: { type: Number, default: 0 },

    // Statut financier
    financialStatus: {
      type: String,
      enum: ["Good", "Critical", "Bad"],
      default: "Critical",
    },

    // Commentaire généré automatiquement
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

// Middleware pour calculer les valeurs financières avant l'enregistrement
MonthlyFinancialActivitiesSchema.pre("save", async function (next) {
  try {
    // Calcul du total des revenus
    if (this.revenuesList.length > 0) {
      const revenueDocs = await mongoose.model("Revenue").find({ _id: { $in: this.revenuesList } });
      this.totalRevenue = revenueDocs.reduce((sum, rev) => sum + (rev.montantTotalPaye || 0), 0);
    } else {
      this.totalRevenue = 0;
    }

    // Calcul du total des dépenses
    if (this.expensesList.length > 0) {
      const expenseDocs = await mongoose.model("MonthlyExpenseResult").find({ _id: { $in: this.expensesList } });
      this.totalExpenses = expenseDocs.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
    } else {
      this.totalExpenses = 0;
    }

    // Calcul du reste et du reste global
    this.rest = this.totalRevenue - this.totalExpenses;
    this.globalRest = this.rest + this.bankFund;

    // Déterminer le statut financier
    if (this.rest > 0) {
      this.financialStatus = "Good";
      this.comment = "The financial situation is stable and profitable.";
    } else if (this.rest === 0) {
      this.financialStatus = "Critical";
      this.comment = "The financial situation is critical, no profit.";
    } else {
      this.financialStatus = "Bad";
      this.comment = "The financial situation is negative, losses recorded.";
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Modèle Mongoose
const MonthlyFinancialActivities = mongoose.model("MonthlyFinancialActivities", MonthlyFinancialActivitiesSchema);

// Validation Joi pour la création
function CreateMonthlyActivityValidation(obj) {
  const schema = Joi.object({
    year: Joi.string().pattern(/^(200[0-9]|20[1-9][0-9]|2100)$/).required(),
    month: Joi.string().pattern(/^(0?[1-9]|1[0-2])$/).required(),
    bankFund: Joi.number().min(0).required(),
    revenuesList: Joi.array().items(Joi.string().hex().length(24)).default([]), // IDs des revenus
    expensesList: Joi.array().items(Joi.string().hex().length(24)).default([]), // IDs des dépenses
    facteurExterne: Joi.number().optional() // Ajout de cette ligne

  });

  return schema.validate(obj);
}

// Validation Joi pour la mise à jour
function UpdateMonthlyActivityValidation(obj) {
  const schema = Joi.object({
    year: Joi.string().pattern(/^(200[0-9]|20[1-9][0-9]|2100)$/),
    month: Joi.string().pattern(/^(0?[1-9]|1[0-2])$/),
    bankFund: Joi.number().min(0),
    revenuesList: Joi.array().items(Joi.string().hex().length(24)),
    expensesList: Joi.array().items(Joi.string().hex().length(24)),
    facteurExterne: Joi.number().optional() // Ajout de cette ligne

  }).min(1);

  return schema.validate(obj);
}

module.exports = {
  MonthlyFinancialActivities,
  CreateMonthlyActivityValidation,
  UpdateMonthlyActivityValidation,
};
