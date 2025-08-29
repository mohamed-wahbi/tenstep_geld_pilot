const mongoose = require("mongoose");

const monthlyExpenseHistorySchema = new mongoose.Schema({
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
}, { timestamps: true });;

const MonthlyExpenseHistory = mongoose.model("MonthlyExpenseHistory", monthlyExpenseHistorySchema);

module.exports = { MonthlyExpenseHistory };
