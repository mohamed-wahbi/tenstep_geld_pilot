// const { mod } = require("@tensorflow/tfjs-node");
const { AnnualFinanceTrainML } = require("../../models/PredictionsModels/AnnualFinance.js")
const { MonthlyFinanceTrainML } = require("../../models/PredictionsModels/MonthlyFinance.js")
const asyncHandler = require("express-async-handler");
const axios = require("axios");
const { PredictionResults } = require("../../models/PredictionsModels/PredictionResults.js");


/*--------------------------------------------------
* @desc    Create new MonthlyFinanc
* @router  POST /api/monthly-Financ/create
* @access  only admin
----------------------------------------------------*/
module.exports.createMonthlyFinanceCtrl = asyncHandler(async (req, res) => {
    const data = new MonthlyFinanceTrainML(req.body);
    await data.save();
    res.status(200).json({ message: "Données mensuelles ajoutées !" });
})



/*--------------------------------------------------
* @desc    Create new AnnualFinance
* @router  POST /api/Annual-Finance/create
* @access  only admin
----------------------------------------------------*/
module.exports.createAnnualFinanceCtrl = asyncHandler(async (req, res) => {
    const data = new AnnualFinanceTrainML(req.body);
    await data.save();
    res.status(200).json({ message: "Données mensuelles ajoutées !" });
})




/*--------------------------------------------------
* @desc    get  AnnualFinance
* @router  GET /api/Monthly-Finance/getAll
* @access  only admin
----------------------------------------------------*/
module.exports.getMonthlyFinanceCtrl = asyncHandler(async (req, res) => {
    const data = await MonthlyFinanceTrainML.find();
    res.json(data);
})



/*--------------------------------------------------
* @desc    get AnnualFinance
* @router  GET /api/Annual-Finance/getAll
* @access  only admin
----------------------------------------------------*/
module.exports.getAnnualFinanceCtrl = asyncHandler(async (req, res) => {
    const data = await AnnualFinanceTrainML.find();
    res.json(data);

})






// _______________________________Generate Prediction Results_____________________________
module.exports.createPredictionResultsCtrl = asyncHandler(async(req,res)=> {
    try {
        const {annee,mois,fondBanc} = req.body

        if (!annee || !mois) {
            return res.status(400).json({ error: "L'année et le mois sont requis" });
        }

         // 1️⃣ Appel de l'API Flask avec les paramètres annee et mois
         const response = await axios.get(`http://127.0.0.1:5001/predict`, {
            params: { annee, mois,fondBanc }
        });

        // 2️⃣ Récupération des résultats
        const predictionData = response.data;
 
        // 3️⃣ Sauvegarde des prédictions dans MongoDB
        const newPrediction = new PredictionResults(predictionData);
        await newPrediction.save();

        res.json(
            { message: "Prédiction sauvegardée" }
        );
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la prédiction" });
    }
})
// __________________________________________________________________________________________



module.exports.getLastPredictionResultsCtrl = asyncHandler(async (req, res) => {
    try {
        const lastPredictionResult = await PredictionResults.findOne().sort({ createdAt: -1 }); // Trier par date de création décroissante

        if (!lastPredictionResult) {
            return res.status(404).json({
                message: "No predicted results yet in the DB!"
            });
        }

        res.json(lastPredictionResult);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération de la dernière prédiction" });
    }
});








module.exports.getAllPredictionResultsCtrl = asyncHandler(async (req, res) => {
    try {
        const allPredictionResult = await PredictionResults.find();

        if (!allPredictionResult) {
            return res.status(404).json({
                message: "No predicted results yet in the DB!"
            });
        }

        res.json(allPredictionResult);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des prédictions" });
    }
});



module.exports.deleteOnePredictionResultsCtrl = asyncHandler(async (req, res) => {
    try {
        const getOneResult = await PredictionResults.findById({_id:req.params.id});

        if (!getOneResult) {
            return res.status(404).json({
                message: "No predicted results yet in the DB!"
            });
        }

        await PredictionResults.findByIdAndDelete({_id:req.params.id})

        res.json({message: " result deleted ."});
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération et supprission des prédictions" });
    }
});











// // Route API pour la prédiction mensuelle
// module.exports.mensuellePredictionCtrl = asyncHandler(async (req, res) => {
//     const { revenu, charges, croissanceRevenu, croissanceCharges, facteurExterne } = req.body;

//     if (!revenu || !charges || !croissanceRevenu || !croissanceCharges || !facteurExterne) {
//         return res.status(400).json({ error: "Données incomplètes !" });
//     }

//     const inputData = [revenu, charges, croissanceRevenu, croissanceCharges, facteurExterne];
//     const result = await predict(inputData);

//     res.json({ message: "Prédiction mensuelle réussie", result });
// })







// module.exports.annualPredictionCtrl = asyncHandler(async (req, res) => {
//     const { revenuTotal, chargesTotal, croissanceRevenu, croissanceCharges, facteurExterne } = req.body;

//     if (!revenuTotal || !chargesTotal || !croissanceRevenu || !croissanceCharges || !facteurExterne) {
//         return res.status(400).json({ error: "Données incomplètes !" });
//     }

//     const inputData = [revenuTotal, chargesTotal, croissanceRevenu, croissanceCharges, facteurExterne];
//     const result = await predict("./models/annualModel", inputData);

//     res.json({ message: "Prédiction annuelle réussie", result });
// })