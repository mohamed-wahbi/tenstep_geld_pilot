const mongoose  = require("mongoose");

const AnnualFinanceSchema = new mongoose.Schema({
    annee: Number,
    revenuAnnuel: Number,
    chargesAnnuelles: Number,
    croissanceRevenu: Number,
    croissanceCharges: Number,
    soldeAnnuel: Number, // revenuTotal - chargesTotal
    facteurExterne: Number, // Moyenne des facteurs externes sur l’année
    reussiteAnnuelle: Number // 1 si (revenuTotal > chargesTotal), sinon 0
});

const AnnualFinanceTrainML = mongoose.model("AnnualFinanceTrainML", AnnualFinanceSchema);

module.exports = {
    AnnualFinanceTrainML
}
