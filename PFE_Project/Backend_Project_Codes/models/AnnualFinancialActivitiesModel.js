const mongoose = require("mongoose");
const Joi = require("joi");

const AnnualFinancialActivitiesSchema = new mongoose.Schema(
  {
    year: { type: String, required: true }, // Financial Year
    bankFund: { type: Number, required: true }, // Initial Bank Fund

    // Total revenue and expenses for the year
    totalRevenue: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },

    // Remaining balance and global remaining balance
    rest: { type: Number, default: 0 },
    globalRest: { type: Number, default: 0 },

    // Financial status
    financialStatus: {
      type: String,
      enum: ["Good", "Critical", "Bad"],
      default: "Critical",
    },

    // Automatically generated comment
    comment: { type: String, default: "" },

    // List of MonthlyFinancialActivities references
    monthlyFinancialActivitiesList: [
      { type: mongoose.Schema.Types.ObjectId, ref: "MonthlyFinancialActivities" },
    ],
  },
  { timestamps: true }
);

// Middleware to calculate financial values before saving
AnnualFinancialActivitiesSchema.pre("save", async function (next) {
  try {
    // Fetch all monthly financial activities for the year
    const monthlyRecords = await mongoose
      .model("MonthlyFinancialActivities")
      .find({ _id: { $in: this.monthlyFinancialActivitiesList } });

    // Ensure all 12 months exist
    if (monthlyRecords.length !== 12) {
      throw new Error("All 12 months must be present for the annual report.");
    }

    // Calculate total revenue and total expenses
    this.totalRevenue = monthlyRecords.reduce((sum, month) => sum + month.totalRevenue, 0);
    this.totalExpenses = monthlyRecords.reduce((sum, month) => sum + month.totalExpenses, 0);

    // Calculate rest and globalRest
    this.rest = this.totalRevenue - this.totalExpenses;
    this.globalRest = this.rest + this.bankFund;

    // Determine financial status and comment
    if (this.rest > 0) {
      this.financialStatus = "Good";
      this.comment = "The annual financial situation is stable and profitable.";
    } else if (this.rest === 0) {
      this.financialStatus = "Critical";
      this.comment = "The annual financial situation is critical, no profit.";
    } else {
      this.financialStatus = "Bad";
      this.comment = "The annual financial situation is negative, losses recorded.";
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Mongoose model
const AnnualFinancialActivities = mongoose.model(
  "AnnualFinancialActivities",
  AnnualFinancialActivitiesSchema
);

// Joi Validation for creation
function CreateAnnualActivityValidation(obj) {
  const schema = Joi.object({
    year: Joi.number().integer().min(2000).max(2100).required(),
    bankFund: Joi.number().min(0).required(),
    monthlyFinancialActivitiesList: Joi.array().items(Joi.string().hex().length(24)).default([]),
    facteurExterne: Joi.number().optional() // Ajout de cette ligne

  });

  return schema.validate(obj);
}

module.exports = {
  AnnualFinancialActivities,
  CreateAnnualActivityValidation,
};
