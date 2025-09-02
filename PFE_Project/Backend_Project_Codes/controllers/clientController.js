const asyncHandler = require("express-async-handler");
const { Client, UpdateClientValidation, CreateClientValidation } = require("../models/clientModel.js");
const axios = require('axios')
const { ClientSecretCredential } = require("@azure/identity");
require("dotenv").config()





// ---------------------------------Token Auto Generate Dataverse-----------------------------------------

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

// // ___________________________________________________________________________________________



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



// ------------------------ Create Client mogodb et sharepoint liste ------------------------



// __________________________________________________________________________________________










/*--------------------------------------------------
* @desc    Create new client
* @router  POST /api/client/create
* @access  only admin
----------------------------------------------------*/
module.exports.createClientCtrl = asyncHandler(async (req, res) => {
    try {
        const { name, cin, email, phone, address, clientType, paymentMethod, currency,status } = req.body;

        // 1️⃣ Validation des données
        const { error } = CreateClientValidation(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // 2️⃣ Vérifier si le client existe déjà
        const findClient = await Client.findOne({ email });
        if (findClient) {
            return res.status(400).json({ message: "Un client avec cet email existe déjà !" });
        }

        // 3️⃣ Ajouter le client dans SharePoint
        const token = await getAccessToken();
        const siteId = await getSiteId();
        const listName = "Clients";

        let newClientSharepoint;
        try {
            const response = await axios.post(
                `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items`,
                {
                    fields: {
                        Title: name,
                        Cin: cin,
                        Email: email,
                        Phone: phone,
                        Address: address,
                        ClientType: clientType,
                        PaymentMethod: paymentMethod,
                        Currency: currency,
                        Status: status
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            newClientSharepoint = response.data;
        } catch (err) {
            return res.status(500).json({ message: "Erreur lors de la création du client dans SharePoint", error: err.message });
        }

        // Vérification des données SharePoint
        if (!newClientSharepoint || !newClientSharepoint.id) {
            return res.status(500).json({ message: "Erreur dans les données renvoyées par SharePoint" });
        }

        // 4️⃣ Créer le client dans MongoDB
        const createCLMongodb = await Client.create({
            name: newClientSharepoint.fields.Title || name,
            idSharepoint: newClientSharepoint.id,
            cin,
            email,
            phone,
            address,
            clientType,
            paymentMethod,
            currency,
            status
        });

        if (!createCLMongodb) {
            return res.status(400).json({ message: "Client non créé dans la base de données MongoDB !" });
        }

        res.status(201).json({
            message: "Client créé avec succès dans SharePoint et MongoDB.",
            client: createCLMongodb
        });

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// _______________________________________________________________________________________________





/*--------------------------------------------------
* @desc    Get all clients
* @router  /api/client/get_all
* @methode GET
* @access  only admin
----------------------------------------------------*/
module.exports.getAllClientCtrl = asyncHandler(async (req, res) => {

    const clients = await Client.find({});
    if (clients.length === 0) {
        return res.status(400).json({
            message: "No clients in the DB !"
        })
    }

    res.status(200).json({
        clients
    })
})


/*--------------------------------------------------
* @desc    Get one clients
* @router  /api/client/getOne/:id
* @methode GET
* @access  only admin
----------------------------------------------------*/
module.exports.getOneClientCtrl = asyncHandler(async (req, res) => {

    const client = await Client.find({ _id: req.params.id });
    if (!client) {
        return res.status(400).json({
            message: "No clients with this id in the DB !"
        })
    }

    res.status(200).json({
        client
    })
})

/*--------------------------------------------------
* @desc    delete one clients
* @router  /api/client/deleteOne/:id
* @methode DELETE
* @access  only admin
----------------------------------------------------*/
module.exports.deleteOneClientCtrl = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // 1️⃣ Vérifier si le client existe dans MongoDB
        const client = await Client.findById(id);
        if (!client) {
            return res.status(404).json({ message: "Client non trouvé dans MongoDB." });
        }


        const idSharepoint = client.idSharepoint; // supposons que tu as stocké l'id SP ici

        if (!idSharepoint) {
            return res.status(400).json({
                message: "❌ Ce client n'a pas d'ID SharePoint associé."
            });
        }

        // ----------------------
    // 2. Supprimer de SharePoint
    // ----------------------
    const token = await getAccessToken();
    const siteId = await getSiteId();
    const listName = "Clients";

    await axios.delete(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items/${idSharepoint}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    // ----------------------
    // 3. Supprimer de MongoDB
    // ----------------------
    const deletedClient = await Client.findByIdAndDelete({ _id: id });

        res.status(200).json({
            message: "✅ Client supprimé avec succès de SharePoint et MongoDB.",
        });

    } catch (error) {
        return res.status(500).json({
            message: "Erreur lors de la suppression.",
        });
    }
});


/*--------------------------------------------------
* @desc    Update one clients
* @router  /api/client/updateOne/:id
* @methode PUT
* @access  only admin
----------------------------------------------------*/
module.exports.updateOneClientCtrl = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, cin, email, phone, address, clientType, paymentMethod, currency,status } = req.body; // nouvelle valeur envoyée depuis Postman

        // 1️⃣ Vérifier si le client existe en MongoDB
        const client = await Client.findById(id);
        if (!client) {
            return res.status(404).json({ message: "Client non trouvé dans MongoDB." });
        }

        const idSharepoint = client.idSharepoint; // stocké dans MongoDB lors de la création
        if (!idSharepoint) {
            return res.status(400).json({
                message: "❌ Ce client n'a pas d'ID SharePoint associé."
            });
        }

        // 3️⃣ Mettre à jour MongoDB
        await Client.findByIdAndUpdate(
            id,
            {
                name,
                cin,
                email,
                phone,
                address,
                clientType,
                paymentMethod,
                currency,
                status
            },
            { new: true } // Retourne l'objet mis à jour
        );

        // ----------------------
        // 3. Modifier dans SharePoint
        // ----------------------
        const token = await getAccessToken();
        const siteId = await getSiteId();
        const listName = "Clients";

        await axios.patch(
            `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items/${idSharepoint}/fields`,
            {
                Title: name,   // On enregistre le name dans la colonne Title
                Cin: cin,
                Email: email,
                Phone: phone,
                Address: address,
                ClientType: clientType,
                PaymentMethod: paymentMethod,
                Currency: currency,
                Status: status
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.status(200).json({
            message: "Client mis à jour avec succès dans MongoDB et Dataverse.",
        });

    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de la mise à jour.",
        });
    }
});



