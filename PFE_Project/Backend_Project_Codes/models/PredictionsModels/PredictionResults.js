const mongoose = require("mongoose");

const PredictionResultsSchema = new mongoose.Schema({
    annee: Number,
    mois: Number, // 1 a 12
    revenuEstime: Number,
    chargesEstimees: Number,
    resteMensuel: Number, // revenuEstime - chargesEstimees
    resteAnnuel: Number, // somme des restes mensuels
    resteGlobal: Number, // resteAnnuel + fond bancaire
    situation: String // "Good", "Bad" ou "Critic"
},
{
    timestamps:true
});

const PredictionResults = mongoose.model("PredictionResults", PredictionResultsSchema);

module.exports = { PredictionResults };
