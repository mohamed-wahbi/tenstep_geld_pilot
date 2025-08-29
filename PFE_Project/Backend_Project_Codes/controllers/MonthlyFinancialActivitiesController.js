const asyncHandler = require("express-async-handler");
const { MonthlyFinancialActivities, CreateMonthlyActivityValidation } = require("../models/MonthlyFinancialActivitiesModel.js");
const { Revenue } = require("../models/RevenueModel.js");
const { MonthlyExpenseResult } = require("../models/MonthlyExpenseResultModel.js");
const { MonthlyFinanceTrainML } = require("../models/PredictionsModels/MonthlyFinance.js")
const axios = require('axios')






// ---------------------------------Token Auto Generate-----------------------------------------

require("dotenv").config()
const { tanentId, clientId, clientSecret, url } = process.env

const getAccessToken = async () => {
    const tokenResponse = await axios.post(
        `https://login.microsoftonline.com/${tanentId}/oauth2/token`,
        new URLSearchParams({
            grant_type: "client_credentials",
            client_id: `${clientId}`,
            client_secret: `${clientSecret}`,
            resource: `${url}`
        })
    );
    return tokenResponse.data.access_token;
};

// ___________________________________________________________________________________________




/*--------------------------------------------------
* @desc    Create Monthly Financial Activities
* @route   /api/monthly-financial-activity/create
* @method  POST
* @access  only admin
----------------------------------------------------*/
module.exports.CreateMonthlyFinancialActivitysCtrl = asyncHandler(async (req, res) => {

    // 3️⃣ Obtenir un token pour Dataverse
    const token = await getAccessToken();

    try {
        // 🔹 1. Validation des données d'entrée
        const { error } = CreateMonthlyActivityValidation(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { year, month, bankFund , facteurExterne} = req.body;

        // 🔹 2. Vérifier si une activité pour ce mois et cette année existe déjà
        const existingActivity = await MonthlyFinancialActivities.findOne({ year, month });
        if (existingActivity) {
            return res.status(400).json({ message: "The financial activity for this month already exists." });
        }

        // 🔹 3. Récupérer les revenus et dépenses associées
        const revenueDocs = await Revenue.find({ year, month });
        if (revenueDocs.length === 0) {
            return res.status(400).json({
                message: "no revenues with this date!"
            })
        }
        const totalRevenue = revenueDocs.reduce((sum, rev) => sum + (rev.montantTotalPaye || 0), 0);
        const revenuesList = revenueDocs.map((rev) => rev._id);

        const expenseDocs = await MonthlyExpenseResult.find({ year, month });
        if (expenseDocs.length === 0) {
            return res.status(400).json({
                message: "no expenses with this date!"
            })
        }
        const totalExpenses = expenseDocs.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
        const expensesList = expenseDocs.map((exp) => exp._id);

        // 🔹 4. Calcul des valeurs financières
        const rest = totalRevenue - totalExpenses; // Le reste disponible après dépenses
        const globalRest = rest + bankFund; // Le reste global incluant les fonds bancaires

        // 🔹 5. Déterminer le statut financier
        let financialStatus = "Critical";
        let comment = "The financial situation is critical, no profit.";

        if (rest > 0) {
            financialStatus = "Good";
            comment = "The financial situation is stable and profitable.";
        } else if (rest < 0) {
            financialStatus = "Bad";
            comment = "The financial situation is negative, losses recorded.";
        }

        // 🔹 6. Création de l'activité financière
        const newActivity = new MonthlyFinancialActivities({
            year,
            month,
            bankFund,
            revenuesList,
            expensesList,
            totalRevenue,
            totalExpenses,
            rest: totalRevenue - totalExpenses,
            globalRest: (totalRevenue - totalExpenses) + bankFund,
            financialStatus,
            comment,
        });




        // 4️⃣ Préparer et envoyer les données vers Dataverse
        const data = {
            cr604_year: year,
            cr604_month: month,
            cr604_bankfund: bankFund,
            cr604_totalrevenue: totalRevenue,
            cr604_totalexpenses: totalExpenses,
            cr604_rest: totalRevenue - totalExpenses,
            cr604_globalrest: (totalRevenue - totalExpenses) + bankFund,
            cr604_financialstatus: financialStatus,
        };

        const dataverseResponse = await axios.post(
            `${url}/api/data/v9.0/cr604_monthly_financial_activities_gps`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // 🔹 7. Enregistrement dans la base de données
        await newActivity.save();

        // Convertir en nombre pour éviter les problèmes de format
        let prevMonth = parseInt(month) - 1;
        let prevYear = parseInt(year);

        if (prevMonth === 0) { // Si on est en janvier, on passe à décembre de l'année précédente
            prevMonth = 12;
            prevYear -= 1;
        }
        
        // Recherche du mois précédent
        const previousMonth = await MonthlyFinancialActivities.findOne({
            year: prevYear.toString(),  // Convertir en string si nécessaire
            month: prevMonth.toString().padStart(2, "0") // S'assurer d'avoir "01", "02", etc.
        })


        let croissanceRevenu = 0, croissanceCharges = 0;
        if (previousMonth) {
            croissanceRevenu = ((totalRevenue - previousMonth.totalRevenue) / (previousMonth.totalRevenue || 1)) * 100;
            croissanceCharges = ((totalExpenses - previousMonth.totalExpenses) / (previousMonth.totalExpenses || 1)) * 100;
        }


        // Calcul du solde annuel et du facteur externe
        const yearlyData = await MonthlyFinancialActivities.find({ year });
        const soldeAnnuel = yearlyData.reduce((sum, entry) => sum + entry.rest, 0);
        console.log(yearlyData.map(entry => ({ mois: entry.month, rest: entry.rest })));

        // Définition du succès annuel
        const reussiteAnnuelle = totalRevenue > totalExpenses ? 1 : 0;

        // Création de l'entrée dans le modèle de prédiction
        const newPrediction = new MonthlyFinanceTrainML({
            mois: parseInt(month),
            annee: parseInt(year),
            revenuTotal: totalRevenue,
            chargesTotal: totalExpenses,
            croissanceRevenu,
            croissanceCharges,
            soldeAnnuel,
            facteurExterne,
            reussiteAnnuelle
        });

        await newPrediction.save();

        res.status(201).json({
            message: "Financial activity created successfully.",
            data: newActivity,
            yearlyData
        });
    } catch (err) {
        res.status(500).json({ message: "Erreur interne du serveur", error: err.message });
    }


});




/*--------------------------------------------------
* @desc    Get All  
* @route   /api/monthly-financial-activity/getAll
* @method  GET
* @access  only admin
----------------------------------------------------*/
module.exports.getAllMonthlyFinancialActivitysCtrl = asyncHandler(async (req, res) => {
    const getAll = await MonthlyFinancialActivities.find({})
    if (!getAll) {
        return res.status(400).json({
            message: "DB is empty!"
        })
    }

    res.status(200).json({
        monthlyFinancialActivitiesData: getAll
    })
});



/*--------------------------------------------------
* @desc    Get the latest Monthly Financial Activity
* @route   /api/monthly-financial-activity/latest
* @method  GET
* @access  only admin
----------------------------------------------------*/
module.exports.getLatestMonthlyFinancialActivityCtrl = asyncHandler(async (req, res) => {
    try {
        const latestActivity = await MonthlyFinancialActivities.findOne().sort({ createdAt: -1 });

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
* @desc    Get All Monthly Financial Activities
* @route   /api/monthly-financial-activity/getAll
* @method  GET
* @access  only admin
----------------------------------------------------*/
module.exports.getOneMonthlyFinancialActivitysCtrl = asyncHandler(async (req, res) => {
    const { year, month } = req.body;

    // Vérifier que year et month sont fournis
    if (!year || !month) {
        return res.status(400).json({ message: "Year and month are required!" });
    }

    try {
        // Récupérer les données avec un filtre sur l'année et le mois
        const getOne = await MonthlyFinancialActivities.findOne({ year, month })
            .populate("revenuesList")
            .populate("expensesList")

        if (!getOne) {
            return res.status(404).json({ message: "No result with this date!" });
        }

        res.status(200).json({ getOneMonthlyActivitie: getOne });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});