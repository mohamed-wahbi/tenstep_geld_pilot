const asyncHandler = require("express-async-handler");
const { ExpenseFix, CreateExpenseFixValidation, UpdateExpenseFixValidation } = require('../models/ExpenseFixModel.js');
const axios = require('axios');
const { ClientSecretCredential } = require("@azure/identity");
require("dotenv").config();






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















// _______________________________SHAREPOINT GRAPH API CONFIG________________________________________


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
// 
// ______________________________________________________________________________________








/*--------------------------------------------------
* @desc    Create new Expense
* @router  /api/expense-fix/create
* @methode POST
* @access  only admin
----------------------------------------------------*/
module.exports.createExpenseFixtCtrl = asyncHandler(async (req, res) => {
    try {
        //   1_Recuperation  
        const { expenseName, expenseType, amount, status, paymentDay } = req.body



        // 1️⃣ Validation des données
        const { error } = CreateExpenseFixValidation(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }


        async function addListItem() {
            const token = await getAccessToken();
            const siteId = await getSiteId();
            const listName = "Charges_Fix";

            // Requête POST pour créer un client
            const response = await axios.post(
                `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items`,
                {
                    fields: {
                        Title: expenseName,
                        ExpenseType: expenseType,
                        Amount: amount,
                        Status: status,
                        PaymentDay: paymentDay
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            return response.data;
        }


        const newChargeFix = await addListItem();

        if (!newChargeFix) {
            return res.status(400).json("Erreur in creating Charge Fix Infos in Sharepoint Liste !")
        }


        const newChargeFixName = newChargeFix.fields.Title
        const newChargeFixId = newChargeFix.fields.id


        const createCLMongodb = await ExpenseFix.create({
            expenseName: newChargeFixName,
            idSharepoint: newChargeFixId,
            expenseType,
            amount,
            status,
            paymentDay
        })



        if (!createCLMongodb) {
            return res.status(400).json({
                message: "Charge fix not created in mongodb data base !"
            })
        }

    } catch (error) {
        res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }

})




/*--------------------------------------------------
* @desc    GET All ExpenseFix
* @router  /api/expense-fix/get_app
* @methode GET
* @access  only admin
----------------------------------------------------*/
module.exports.getAllExpenseFixCtrl = asyncHandler(async (req, res) => {

    const expensesFixs = await ExpenseFix.find({}).sort({ _id: -1 });
    if (expensesFixs.length === 0) {
        return res.status(400).json({
            message: "No Expenses Fixs in the DB !"
        })
    }

    res.status(200).json({
        Expenses_Fixs: expensesFixs
    })
})


/*--------------------------------------------------
* @desc    GET All ExpenseFix
* @router  /api/expense-fix/get_app
* @methode GET
* @access  only admin
----------------------------------------------------*/
module.exports.getManyExpenseFixCtrl = asyncHandler(async (req, res) => {

    try {
        let ids = req.query.ids; // Récupération de la liste des _id depuis la requête
        if (!ids) {
            return res.status(400).json({ message: "Aucun ID fourni" });
        }

        ids = ids.split(','); // Convertir la chaîne en tableau

        const clients = await ExpenseFix.find({ _id: { $in: ids } });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }


})



/*--------------------------------------------------
* @desc    Get one ExpenseFix
* @router  /api/expense-fix/getOne/:id
* @methode GET
* @access  only admin
----------------------------------------------------*/
module.exports.getOneExpenseFixCtrl = asyncHandler(async (req, res) => {

    const oneExpenseFix = await ExpenseFix.find({ _id: req.params.id });
    if (!oneExpenseFix) {
        return res.status(400).json({
            message: "No Expense-Fix with this id in the DB !"
        })
    }

    res.status(200).json({
        oneExpenseFix
    })
})



/*--------------------------------------------------
* @desc    delete one ExpneseFix
* @router  /api/expense-fix/deleteOne/:id
* @methode DELETE
* @access  only admin
----------------------------------------------------*/
module.exports.deleteOneExpenseFixCtrl = asyncHandler(async (req, res) => {



    try {
        const { id } = req.params;



        // ----------------------
        // 1. Récupérer le client depuis MongoDB
        // ----------------------
        const chargeFix = await ExpenseFix.findById(id);

        if (!chargeFix) {
            return res.status(404).json({
                message: "⚠️ Charge fix non trouvé dans MongoDB."
            });
        }

        const idSharepoint = chargeFix.idSharepoint; // supposons que tu as stocké l'id SP ici

        if (!idSharepoint) {
            return res.status(400).json({
                message: "❌ Ce charge fix n'a pas d'ID SharePoint associé."
            });
        }


        const token = await getAccessToken();
        const siteId = await getSiteId();
        const listName = "Charges_Fix";

        await axios.delete(
            `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items/${idSharepoint}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        // 5️⃣ Supprimer l'enregistrement dans MongoDB
        await ExpenseFix.findByIdAndDelete(id);

        res.status(200).json({
            message: "Charge supprimé de MongoDB et Dataverse.",
        });

    } catch (error) {
        return res.status(500).json({
            message: "Erreur lors de la suppression.",
        });
    }
})



/*--------------------------------------------------
* @desc    Update one Expense Fix
* @router  /api/expense-fix/updateOne/:id
* @methode PUT
* @access  only admin
----------------------------------------------------*/
module.exports.updateOneExpenseFixCtrl = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { expenseName, expenseType, amount, status, paymentDay } = req.body; // nouvelle valeur envoyée depuis Postman


        const chargeFix = await ExpenseFix.findById(id);

        if (!chargeFix) {
            return res.status(404).json({
                message: "⚠️ charge fix non trouvé dans MongoDB."
            });
        }


        const idSharepoint = chargeFix.idSharepoint; // stocké dans MongoDB lors de la création
        if (!idSharepoint) {
            return res.status(400).json({
                message: "❌ Ce client n'a pas d'ID SharePoint associé."
            });
        }

        await ExpenseFix.findByIdAndUpdate(
            id,
            {
                expenseName,
                expenseType,
                amount,
                status,
                paymentDay
            },
            { new: true } // Retourne l'objet mis à jour
        );



        const token = await getAccessToken();
        const siteId = await getSiteId();
        const listName = "Charges_Fix";

        await axios.patch(
            `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items/${idSharepoint}/fields`,
            {
                Title: expenseName,
                ExpenseType: expenseType,
                Amount: amount,
                Status: status,
                PaymentDay: paymentDay
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );


        // ----------------------
        // 4. Réponse finale
        // ----------------------
        res.status(200).json({
            message: "✅ Client modifié avec succès dans MongoDB et SharePoint.",

        });

    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de la mise à jour.",
        });
    }


})


