const asyncHandler = require("express-async-handler");
const { MonthlyExpenseHistory } = require('../models/MonthlyExpenseHistoryModel.js')
const { MonthlyExpense } = require("../models/monthlyExpenseModel.js");
const { MonthlyExpenseResult } = require("../models/MonthlyExpenseResultModel.js");
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


            // Étape 5: inserer les donnee au dataverse :
            const insertDataIntoDataverse = expensesToArchive.map(expense => ({
                cr604_covredday: expense.covredDay.toString(), // Convertir en string si nécessaire
                cr604_expensename: expense.expenseName,
                cr604_year: expense.year.toString(), // Correction ici
                cr604_expensetype: expense.expenseType,
                cr604_estimatedamount: expense.estimatedAmount.toString(), // Si nécessaire
                cr604_actualamount: expense.actualAmount.toString(), // Si nécessaire
                cr604_chargestatus: expense.chargeStatus,
                cr604_month: expense.month.toString(), // Correction ici
            }));
            
            try {
                // Envoyer chaque objet individuellement avec `Promise.all`
                const responses = await Promise.all(
                    insertDataIntoDataverse.map(data =>
                        axios.post(
                            `${url}/api/data/v9.0/cr604_expense_result_gps`,
                            data,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                },
                            }
                        )
                    )
                );
            
            } catch (error) {
                console.error("Erreur lors de l'insertion dans Dataverse:", error.response?.data || error);
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