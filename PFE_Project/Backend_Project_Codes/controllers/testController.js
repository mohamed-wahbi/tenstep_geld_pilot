const asyncHandler = require("express-async-handler");
const { TestModel } = require("../models/testModel.js");
const axios = require("axios");



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






module.exports.createTestCtrl = asyncHandler(async (req, res) => {
    try {

        // 2️⃣ Obtenir un token pour Dataverse
        const token = await getAccessToken();

        // 3️⃣ Préparer et envoyer les données vers Dataverse
        const data = {
            cr604_name: req.body.name,
            cr604_age: req.body.age,  
            cr604_email: req.body.email
        };

        const dataverseResponse = await axios.post(
            `${url}/api/data/v9.0/cr604_tests`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // 4️⃣ Extraire l'ID de Dataverse depuis l'en-tête `location`
        const locationHeader = dataverseResponse.headers.location; 
        const dataverseId = locationHeader.match(/\((.*?)\)/)[1]; // Extraction de l'ID



        // 1️⃣ Enregistrer dans MongoDB
        const nouveauTest = new TestModel({
            name: req.body.name,
            age: req.body.age,
            email: req.body.email,
            dataverseId: dataverseId 
        });

        await nouveauTest.save();

       

        res.status(201).json({
            message: "Création réussie ! in MongoDB and Dataverse",
            nouveauTest
        });

    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de la création",
        });
    }
});








module.exports.deleteTestCtrl = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // 1️⃣ Vérifier si le test existe dans MongoDB
        const test = await TestModel.findById(id);
        if (!test) {
            return res.status(404).json({ message: "Test non trouvé dans MongoDB." });
        }

        // 2️⃣ Récupérer l'ID de Dataverse
        const dataverseId = test.dataverseId;
        if (!dataverseId) {
            return res.status(400).json({ message: "ID Dataverse introuvable." });
        }

        // 3️⃣ Obtenir un token valide pour Dataverse
        const token = await getAccessToken();

        // 4️⃣ Supprimer l'enregistrement dans Dataverse
        await axios.delete(
            `${url}/api/data/v9.0/cr604_tests(${dataverseId})`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // 5️⃣ Supprimer l'enregistrement dans MongoDB
        await TestModel.findByIdAndDelete(id);

        res.status(200).json({
            message: "Test supprimé de MongoDB et Dataverse.",
        });

    } catch (error) {
       return res.status(500).json({
            message: "Erreur lors de la suppression.",
        });
    }
});












module.exports.updateTestCtrl = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // 1️⃣ Vérifier si le test existe en MongoDB
        const test = await TestModel.findById(id);
        if (!test) {
            return res.status(404).json({ message: "Test non trouvé dans MongoDB." });
        }

        // 2️⃣ Récupérer l'ID Dataverse
        const dataverseId = test.dataverseId;
        if (!dataverseId) {
            return res.status(400).json({ message: "ID Dataverse introuvable." });
        }

        // 3️⃣ Mettre à jour MongoDB
        const updatedTest = await TestModel.findByIdAndUpdate(
            id,
            {
                name: req.body.name || test.name,
                age: req.body.age || test.age,
                email: req.body.email || test.email,
            },
            { new: true } // Retourne le document mis à jour
        );

        // 4️⃣ Obtenir un token valide pour Dataverse
        const token = await getAccessToken();

        // 5️⃣ Mettre à jour l'entrée Dataverse
        const data = {
            cr604_name: req.body.name || test.name,
            cr604_age: req.body.age || test.age,
            cr604_email: req.body.email || test.email
        };

        await axios.patch(
            `${url}/api/data/v9.0/cr604_tests(${dataverseId})`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.status(200).json({
            message: "Test mis à jour avec succès dans MongoDB et Dataverse.",
        });

    } catch (error) {

        res.status(500).json({
            message: "Erreur lors de la mise à jour.",
        });
    }
});
