const asyncHandler = require("express-async-handler");
const { AnnualFinancialActivities, CreateAnnualActivityValidation } = require("../models/AnnualFinancialActivitiesModel.js");
const { MonthlyFinancialActivities } = require("../models/MonthlyFinancialActivitiesModel.js");
const axios = require('axios')
const { AnnualFinanceTrainML } = require('../models/PredictionsModels/AnnualFinance.js')
const { ClientSecretCredential } = require("@azure/identity");
require("dotenv").config();





// ---------------------------------Token Auto Generate-----------------------------------------

// require("dotenv").config()
// const { tanentId, clientId, clientSecret, url } = process.env

// const getAccessToken = async () => {
//   const tokenResponse = await axios.post(
//     `https://login.microsoftonline.com/${tanentId}/oauth2/token`,
//     new URLSearchParams({
//       grant_type: "client_credentials",
//       client_id: `${clientId}`,
//       client_secret: `${clientSecret}`,
//       resource: `${url}`
//     })
//   );
//   return tokenResponse.data.access_token;
// };

// ___________________________________________________________________________________________







/*--------------------------------------------------
* @desc    Create Annual Financial Activities
* @route   /api/annual-financial-activity/create
* @method  POST
* @access  only admin
----------------------------------------------------*/

module.exports.createAnnualFinancialActivityCtrl = asyncHandler(async (req, res) => {

  // 1️⃣ Obtenir un token pour Dataverse
  const token = await getAccessToken();

  // 2️⃣ Validation des données d'entrée
  const { error } = CreateAnnualActivityValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { year, bankFund, facteurExterne } = req.body;

  // 3️⃣ Vérifier si les activités annuelles existent déjà pour cette année
  const annualActivityVerification = await AnnualFinancialActivities.findOne({ year });
  if (annualActivityVerification) {
    return res.status(400).json({
      message: "Annual activities for this year have already been generated."
    });
  }

  // 4️⃣ Récupérer les activités mensuelles
  const monthlyActivities = await MonthlyFinancialActivities.find({ year });

  if (monthlyActivities.length !== 12) {
    return res.status(404).json({ message: "All 12 months must be present for the annual report." });
  }

  // 5️⃣ Calcul des totaux annuels
  const totalRevenue = monthlyActivities.reduce((sum, activity) => sum + (activity.totalRevenue || 0), 0);
  const totalExpenses = monthlyActivities.reduce((sum, activity) => sum + (activity.totalExpenses || 0), 0);
  const soldeAnnuel = totalRevenue - totalExpenses;
  const globalRest = soldeAnnuel + bankFund;

  // 6️⃣ Déterminer le statut financier
  let financialStatus = "Critical";
  let comment = "The financial situation is critical, no profit.";

  if (soldeAnnuel > 0) {
    financialStatus = "Good";
    comment = "The financial situation is stable and profitable.";
  } else if (soldeAnnuel < 0) {
    financialStatus = "Bad";
    comment = "The financial situation is negative, losses recorded.";
  }

  // 7️⃣ Enregistrer l'activité financière annuelle
  const annualActivity = new AnnualFinancialActivities({
    year,
    bankFund,
    totalRevenue,
    totalExpenses,
    soldeAnnuel,
    globalRest,
    financialStatus,
    comment,
    monthlyFinancialActivitiesList: monthlyActivities.map(activity => activity._id),
  });

  await annualActivity.save();

  // 8️⃣ Envoyer les données vers SharePoint
  const insertDataIntoSharepointListe = {
    Title: "Activité Financière " + year,   // ⚠️ 'Title' obligatoire dans SharePoint
    Year: year.toString(),
    BankFund: bankFund.toString(),
    TotalRevenue: totalRevenue.toString(),
    TotalExpenses: totalExpenses.toString(),
    Rest: soldeAnnuel.toString(),
    GlobalRest: globalRest.toString(),
    FinancialStatus: financialStatus,
  };
  
  
  try {
    const token = await getAccessToken();
    const siteId = await getSiteId();
    const listName = "Manage_Annual_Activities"; // Nom de ta liste SharePoint

    const response = await axios.post(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items`,
      { fields: insertDataIntoSharepointListe },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );


    console.log("Insertion réussie dans SharePoint :", response.data);
  } catch (error) {
    console.error("Erreur lors de l'insertion dans SharePoint :", error.response?.data || error);
  }


  // 9️⃣ Récupération des données de l'année précédente
  const previousYearData = await AnnualFinancialActivities.findOne({ year: (parseInt(year) - 1).toString() });

  let croissanceRevenu = 0, croissanceCharges = 0;
  if (previousYearData) {
    croissanceRevenu = ((totalRevenue - previousYearData.totalRevenue) / (previousYearData.totalRevenue || 1)) * 100;
    croissanceCharges = ((totalExpenses - previousYearData.totalExpenses) / (previousYearData.totalExpenses || 1)) * 100;
  }

  // 🔟 Enregistrer les données dans le modèle d'entraînement ML
  const newAnnualPrediction = new AnnualFinanceTrainML({
    annee: year,
    revenuAnnuel: totalRevenue,
    chargesAnnuelles: totalExpenses,
    croissanceRevenu,
    croissanceCharges,
    soldeAnnuel,
    facteurExterne,
    reussiteAnnuelle: soldeAnnuel > 0 ? 1 : 0
  });

  await newAnnualPrediction.save();

  // ✅ Réponse finale
  res.status(201).json({
    message: "Annual Financial Activity created successfully",
    currentYearData: annualActivity,
  });

});


/*--------------------------------------------------
* @desc    Get the latest Monthly Financial Activity
* @route   /api/monthly-financial-activity/latest
* @method  GET
* @access  only admin
----------------------------------------------------*/
module.exports.getLatestAnnualFinancialActivityCtrl = asyncHandler(async (req, res) => {
  try {
    const latestActivity = await AnnualFinancialActivities.findOne().sort({ createdAt: -1 });

    if (!latestActivity) {
      return res.status(404).json({
        message: "No financial activity found!"
      });
    }

    res.status(200).json({
      latestActivity
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});



/*--------------------------------------------------
* @desc    Get One Annual Financial Activities
* @route   /api/annual-financial-activity/getOne
* @method  POST
* @access  only admin
----------------------------------------------------*/
module.exports.getOneAnnualFinancialActivitysCtrl = asyncHandler(async (req, res) => {
  const { year } = req.body;

  // Vérifier que year et month sont fournis
  if (!year) {
    return res.status(400).json({ message: "Year required!" });
  }

  try {
    // Récupérer les données avec un filtre sur l'année et le mois
    const getOne = await AnnualFinancialActivities.findOne({ year })
      .populate("monthlyFinancialActivitiesList")

    if (!getOne) {
      return res.status(404).json({ message: "No result with this date!" });
    }

    res.status(200).json({ getOneAnnualActivitie: getOne });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});