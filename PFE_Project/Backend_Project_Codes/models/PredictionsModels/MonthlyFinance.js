const mongoose = require("mongoose");

const MonthlyPredictionSchema = new mongoose.Schema({
    mois: Number, // 1 à 12
    annee: Number,
    revenuTotal: Number,
    chargesTotal: Number,
    croissanceRevenu: Number,
    croissanceCharges: Number,
    soldeAnnuel: Number, // revenuTotal - chargesTotal
    facteurExterne: Number, // Moyenne des facteurs externes sur l’année
    reussiteAnnuelle: Number // 1 si (revenuTotal > chargesTotal), sinon 0

});



const MonthlyFinanceTrainML = mongoose.model("MonthlyFinanceTrainML", MonthlyPredictionSchema);

module.exports = {
    MonthlyFinanceTrainML
}