const asyncHandler = require("express-async-handler");
const { Revenue } = require("../models/RevenueModel");
const { Invoice } = require("../models/invoiceModel");
const { InvoiceHistory } = require("../models/invoiceHistoryModel");
const axios = require('axios')
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
* @desc    Get All revenues
* @router  /api/revenue/getAll
* @methode GET
* @access  only admin
----------------------------------------------------*/
module.exports.getRevenuesCtrl = asyncHandler(async (req, res) => {
    const revenues = await Revenue.find({ isConfirmed: false })
    if (revenues.length === 0) {
        return res.status(400).json({
            message: "No Revenues in the DB !"
        })
    }

    res.status(200).json({
        revenues,

    })
})


/*--------------------------------------------------
* @desc    Confirmed Monthly revenues
* @router  /api/revenue/confirme
* @methode POST
* @access  only admin
----------------------------------------------------*/
module.exports.confirmeRevenueCtrl = asyncHandler(async (req, res) => {
    const revenues = await Revenue.find({ isConfirmed: false })
    if (revenues.length === 0) {
        return res.status(400).json({
            message: "No Revenues to be confirmed in the DB !"
        })
    }

    await Revenue.updateMany({ isConfirmed: false }, { $set: { isConfirmed: true } });


    res.status(200).json({
        message: "All revenue of this month are successfuly confirmed."

    })
})



/*--------------------------------------------------
* @desc    generate Monthly Revenue
* @router  /api/revenue/generate
* @methode POST
* @access  only admin
----------------------------------------------------*/
module.exports.generateRevCtrl = asyncHandler(async (req, res) => {
    const { year, month } = req.params;

    // 3️⃣ Obtenir un token pour Dataverse
    // const token = await getAccessToken();

    try {
        const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const invoices = await Invoice.find({
            statut: 'discharged',
            datePaiementEntreprise: { $gte: startDate, $lt: endDate }
        });

        if (invoices.length === 0) {
            return res.status(400).json({ message: "No paid invoices found for this period!" });
        }

        // Stocker les factures dans InvoiceHistory
        const invoicesHistory = invoices.map(invoice => ({
            id_invoice: invoice._id,
            id_client: invoice.id_client,
            clientName: invoice.clientName,
            montantInitial: invoice.montantInitial,
            remise: invoice.remise,
            montantApresRemise: invoice.montantApresRemise,
            montantPaye: invoice.montantPaye,
            datePaiementEntreprise: invoice.datePaiementEntreprise,
            datePaiementClient: invoice.datePaiementClient,
            commentairePaiement: invoice.commentairePaiement,
            statut: invoice.statut,
        }));


        // ______________________SharePoint insertion au lieu de Dataverse____________________
        const insertDataIntoSharePoint = invoices.map(invoice => ({
            fields: {
                Title: invoice.clientName,   // ⚠️ "Title" obligatoire dans une liste SharePoint
                MontantPaye: invoice.montantPaye,
                DatePaiementEntreprise: invoice.datePaiementEntreprise,
                CommentairePaiement: invoice.commentairePaiement
            }
        }));
                        
        try {
            // Récupérer token + siteId
            const token = await getAccessToken();
            const siteId = await getSiteId();
            const listName = "Invoices"; // nom de ta liste SharePoint

            // Insérer chaque item dans SharePoint en parallèle
            const responses = await Promise.all(
                insertDataIntoSharePoint.map(data =>
                    axios.post(
                        `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items`,
                        data,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    )
                )
            );

        } catch (error) {
            return res.status(502).json({
                message: "Erreur lors de l'insertion dans SharePoint"
            });
        }



        // insersion des facture payer dans le invoice history
        await InvoiceHistory.insertMany(invoicesHistory);

        // Générer les revenus mensuels
        const groupedData = invoices.reduce((acc, invoice) => {
            const key = `${year}-${month}-${invoice.id_client}`;

            if (!acc[key]) {
                acc[key] = {
                    year: `${year}`,
                    month: `${month}`,
                    id_client: invoice.id_client,
                    nomClient: invoice.clientName,
                    nombreFacturesPayees: 0,
                    montantTotalPaye: 0,
                };
            }

            acc[key].nombreFacturesPayees += 1;
            acc[key].montantTotalPaye += invoice.montantPaye;

            return acc;
        }, {});

        const revenues = Object.values(groupedData);



        // ______________________SharePoint insertion Revenue_Results au lieu de Dataverse____________________
        const insertRevenueResultsDataIntoSharePoint = revenues.map(revenue => ({
            fields: {
                Title: revenue.nomClient,              // ⚠️ Champ obligatoire "Title" dans SharePoint
                Year: revenue.year,
                Month: revenue.month,
                MontantTotalPaye: revenue.montantTotalPaye,
                NombreFacturesPaye: revenue.nombreFacturesPayees
            }


        }));

        try {
            // Récupérer token + siteId
            const token = await getAccessToken();
            const siteId = await getSiteId();
            const listName = "Revenue_Results"; // nom de la liste SharePoint

            // Insérer chaque agrégat dans SharePoint en parallèle
            const responses = await Promise.all(
                insertRevenueResultsDataIntoSharePoint.map(data =>
                    axios.post(
                        `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items`,
                        data,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    )
                )
            );

        } catch (error) {
            return res.status(502).json({
                message: "Erreur lors de l'insertion dans SharePoint (Revenue_Results)"
            });
        }

        await Revenue.insertMany(revenues);

        // Supprimer les factures archivées du modèle Invoice
        await Invoice.deleteMany({ statut: 'discharged', datePaiementEntreprise: { $gte: startDate, $lt: endDate } });


        res.status(200).json({
            message: "Revenue generated and invoices archived successfully.",
            year,
            month
        });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});