const mongoose = require("mongoose");

const monthlyExpenseResultSchema = new mongoose.Schema({
    month: { type: String, required: true },
    year: { type: String, required: true },
    isConfirmed: { type: Boolean, default: false },
    expenseType: {
      type: String,
      enum: ["Payroll", "Admin", "Training", "Marketing", "Travel", "HR", "Other"],
      required: true,
    },
    totalAmount: { type: Number, min: 0, required: true },
    totalCharges: { type: Number, default: 0 }, // Ajout ici
  }, { timestamps: true });

const MonthlyExpenseResult = mongoose.model("MonthlyExpenseResult", monthlyExpenseResultSchema);

module.exports = { MonthlyExpenseResult };
