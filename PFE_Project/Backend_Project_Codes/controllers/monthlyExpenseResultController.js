const asyncHandler = require("express-async-handler");
const { MonthlyExpenseHistory } = require('../models/MonthlyExpenseHistoryModel.js')
const { MonthlyExpense } = require("../models/monthlyExpenseModel.js");
const { MonthlyExpenseResult } = require("../models/MonthlyExpenseResultModel.js");
const axios = require('axios');
const { ClientSecretCredential } = require("@azure/identity");
require("dotenv").config()






// ---------------------------------Token Auto Generate-----------------------------------------

// require("dotenv").config()
// const { tanentId, clientId, clientSecret, url } = process.env

// const getAccessToken = async () => {
//     const tokenResponse = await axios.post(
//         `https://login.microsoftonline.com/${tanentId}/oauth2/token`,
//         new URLSearchParams({
//             grant_type: "client_credentials",
//             client_id: `${clientId}`,
//             client_secret: `${clientSecret}`,
//             resource: `${url}`
//         })
//     );
//     return tokenResponse.data.access_token;
// };

// ___________________________________________________________________________________________


// ________________________1_ Graph API Tken Keys ___________________________
const tenantId = process.env.tenantId;
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;

// Token Graph
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
// --------------------------------------------------------------------------------

// ________________________2_ Generate Token With Graph API________________________
async function getAccessToken() {
    const token = await credential.getToken("https://graph.microsoft.com/.default");
    return token.token;
}
// --------------------------------------------------------------------------------


// ________________________3_ Generate Site ID With Graph API ________________________
async function getSiteId() {
    const token = await getAccessToken();
    const sitePath = "tenstepfrance.sharepoint.com:/sites/GeldPilot:"; // important les ":" à la fin

    const response = await axios.get(
        `https://graph.microsoft.com/v1.0/sites/${sitePath}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data.id; // récupère le siteId réel
}
// --------------------------------------------------------------------------------






/*--------------------------------------------------
* @desc    Generate Monthly Expenses Result and Archive History
* @router  /api/monthly-Expense-result/generate/:year/:month
* @method  POST
* @access  only admin
----------------------------------------------------*/
module.exports.monthExpensResManuelyCtrl = asyncHandler(async (req, res) => {
    const { year, month } = req.params;
    // 3️⃣ Obtenir un token pour Dataverse
    const token = await getAccessToken();

    try {
        // Convertir `year` en Number
        const numericYear = parseInt(year);

        // Étape 1: Regrouper les dépenses mensuelles filtrées
        const aggregatedResults = await MonthlyExpense.aggregate([
            {
                $match: {
                    year: numericYear,
                    month: month,
                    covredDay: { $ne: null }, // Filtrer ceux qui ont un `covredDay` non nul
                },
            },
            {
                $group: {
                    _id: "$expenseType",
                    totalAmount: { $sum: "$actualAmount" }, // Somme des montants payés
                    totalCharges: { $sum: 1 }, // Nombre de charges
                },
            },
        ]);

        // Vérifier s'il y a des résultats à traiter
        if (aggregatedResults.length === 0) {
            return res.status(200).json({ message: "Aucune donnée à générer", year, month });
        }

        // Étape 2: Insérer les résultats dans MonthlyExpenseResult
        const resultsToInsert = aggregatedResults.map(result => ({
            month,
            year: numericYear,
            expenseType: result._id,
            totalAmount: result.totalAmount,
            totalCharges: result.totalCharges,
            isConfirmed: false,
        }));

        await MonthlyExpenseResult.insertMany(resultsToInsert);

        // Étape 3: Récupérer toutes les dépenses du mois à archiver (celles utilisées dans l'agrégation)
        const expensesToArchive = await MonthlyExpense.find({
            year: numericYear,
            month: month,
            covredDay: { $ne: null }, // Sélectionner uniquement celles avec `covredDay` non nul
        });

        if (expensesToArchive.length > 0) {
            // Étape 4: Insérer les dépenses dans MonthlyExpenseHistory
            const historyToInsert = expensesToArchive.map(expense => ({
                month: expense.month,
                year: expense.year,
                expenseId: expense.expenseId || null, // Garde la référence si elle existe
                expenseName: expense.expenseName,
                expenseType: expense.expenseType,
                estimatedAmount: expense.estimatedAmount || null,
                actualAmount: expense.actualAmount,
                chargeStatus: expense.chargeStatus,
                covredDay: expense.covredDay || null,
            }));


            // 1️⃣ Préparer les données pour SharePoint
            const insertDataIntoSharepointListe = expensesToArchive.map(expense => ({
                Title: expense.expenseName,               // ⚠️ SharePoint nécessite 'Title'
                Covredday: expense.covredDay.toString(),
                Year: expense.year.toString(),
                ExpenseType: expense.expenseType,
                EstimatedAmount: expense.estimatedAmount.toString(),
                ActualAmount: expense.actualAmount.toString(),
                ChargeStatus: expense.chargeStatus,
                Month: expense.month.toString(),
            }));

            // 2️⃣ Insérer chaque élément dans la liste SharePoint
            const token = await getAccessToken();
            const siteId = await getSiteId();
            const listName = "Expense_Result"; // Nom de la liste SharePoint

            try {
                const responses = await Promise.all(
                    insertDataIntoSharepointListe.map(item =>
                        axios.post(
                            `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items`,
                            { fields: item },
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                },
                            }
                        )
                    )
                );

                console.log("Insertion dans SharePoint réussie :", responses.length, "éléments insérés.");
            } catch (error) {
                console.error("Erreur lors de l'insertion dans SharePoint :", error.response?.data || error);
            }



            await MonthlyExpenseHistory.insertMany(historyToInsert);

            // Étape 5: Supprimer les dépenses utilisées pour générer MonthlyExpenseResult
            const expenseIdsToDelete = expensesToArchive.map(expense => expense._id);

            await MonthlyExpense.deleteMany({ _id: { $in: expenseIdsToDelete } });
        }

        res.status(201).json({
            message: "Données générées et archivées avec succès.",
            year,
            month,
            insertedResults: resultsToInsert,
            archivedExpenses: expensesToArchive.length,
        });

    } catch (error) {
        console.error("Erreur lors de la génération des résultats et de l'archivage:", error);
        res.status(500).json({ message: "Erreur interne du serveur", error });
    }
});






/*--------------------------------------------------
* @desc    Get all Monthly Expenses Result
* @router  /api/monthly-Expense-result/getAll
* @methode Get
* @access  only admin
----------------------------------------------------*/
module.exports.getAllMonthlyExpenseResultCtrl = asyncHandler(async (req, res) => {
    const getAll = await MonthlyExpenseResult.find({ isConfirmed: false })
    if (!getAll) {
        return res.status(400).json({
            message: "No Monthly Expense Result in the DB"
        })
    }

    res.status(200).json({
        MonthlyExpenseResultDatas: getAll
    })
})

/*--------------------------------------------------
* @desc    Get all Monthly Expenses Result
* @router  /api/monthly-Expense-result/getAll
* @methode Get
* @access  only admin
----------------------------------------------------*/
module.exports.getAllConfirmedMonthlyExpenseResultCtrl = asyncHandler(async (req, res) => {
    const getAll = await MonthlyExpenseResult.find({ isConfirmed: true })
    if (!getAll) {
        return res.status(400).json({
            message: "No Monthly Expense Result in the DB"
        })
    }

    res.status(200).json({
        MonthlyExpenseResultDatas: getAll
    })
})


/*--------------------------------------------------
* @desc    Confirmer tous les MonthlyExpenseResult
* @router  /api/monthly-Expense-result/confirm-all
* @method  PUT
* @access  only admin
----------------------------------------------------*/
module.exports.confirmAllMonthlyExpenseResults = asyncHandler(async (req, res) => {
    try {
        // Mettre à jour tous les MonthlyExpenseResult où `isConfirmed` est false
        const result = await MonthlyExpenseResult.updateMany(
            { isConfirmed: false },  // Filtrer par `isConfirmed = false`
            { $set: { isConfirmed: true } }  // Mise à jour de `isConfirmed` à `true`
        );

        // Vérifier si des documents ont été modifiés
        if (result.nModified > 0) {
            res.status(200).json({
                message: `${result.nModified} MonthlyExpenseResult(s) ont été confirmés.`,
            });
        } else {
            res.status(200).json({
                message: "Aucun MonthlyExpenseResult à confirmer.",
            });
        }

    } catch (error) {
        console.error("Erreur lors de la confirmation des résultats:", error);
        res.status(500).json({ message: "Erreur interne du serveur", error });
    }
});