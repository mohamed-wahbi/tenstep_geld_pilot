from flask import Flask, jsonify
import tensorflow as tf
import numpy as np
import pandas as pd
from pymongo import MongoClient
from flask import Flask, request, jsonify


app = Flask(__name__)

# Connexion MongoDB
client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["Geld_Pilot"]

# Charger les données
def get_finance_data():
    monthly_data = list(db.monthlyfinancetrainmls.find({}, {"_id": 0}))
    annual_data = list(db.annualfinancetrainmls.find({}, {"_id": 0}))

    df_monthly = pd.DataFrame(monthly_data)
    df_annual = pd.DataFrame(annual_data)

    if df_monthly.empty:
        print("⚠️ Aucune donnée récupérée depuis MonthlyFinanceTrainML !")
    else:
        print("Colonnes disponibles dans df_monthly :", df_monthly.columns)

    if df_annual.empty:
        print("⚠️ Aucune donnée récupérée depuis AnnualFinanceTrainML !")
    else:
        print("Colonnes disponibles dans df_annual :", df_annual.columns)

    return df_monthly, df_annual


def train_and_predict(annee, mois, fondBanc):
    df_monthly, df_annual = get_finance_data()

    # Vérification si l'année existe dans les données
    df_selected = df_monthly[(df_monthly["annee"] == annee) & (df_monthly["mois"] == mois)]
    if df_selected.empty:
        return {"error": f"Aucune donnée disponible pour {mois}/{annee}"}
    

    # Ajout des nouvelles features basées sur les données annuelles
    df_monthly["revenuAnnuelMoyen"] = df_monthly.groupby("annee")["revenuTotal"].transform("mean")
    df_monthly["chargesAnnuellesMoyennes"] = df_monthly.groupby("annee")["chargesTotal"].transform("mean")
    df_monthly["croissanceAnnuelle"] = df_monthly["revenuAnnuelMoyen"].pct_change().fillna(0)


    # Sélection des features pour l'entraînement
    features = ["revenuTotal", "chargesTotal", "croissanceRevenu", "croissanceCharges", "facteurExterne",
                "revenuAnnuelMoyen", "chargesAnnuellesMoyennes", "croissanceAnnuelle"]
    

    X = df_monthly[features].values
    y = df_monthly["revenuTotal"].values  # Variable cible

    # Création du modèle TensorFlow
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation="relu"),
        tf.keras.layers.Dense(32, activation="relu"),
        tf.keras.layers.Dense(1)  # Prédiction du revenu
    ])
    
    model.compile(optimizer="adam", loss="mse")
    
    # Entraînement
    model.fit(X, y, epochs=50, verbose=0)
    
    # Prédiction du revenu du prochain mois
    dernier_mois = df_monthly.iloc[-1][features].values.reshape(1, -1)
    revenu_estime = float(model.predict(dernier_mois)[0][0])  # Convertir en float

    # Estimation des charges basées sur une moyenne
    charges_estimees = float(np.mean(df_monthly["chargesTotal"]))

    # Calcul du reste mensuel, annuel et global
    reste_mensuel = float(revenu_estime - charges_estimees)
    reste_annuel = float(reste_mensuel * 12)  # Simplification
    fond_bancaire = fondBanc  # Ex. fond restant en banque
    reste_global = float(reste_annuel + fond_bancaire)

    # Détermination de la situation financière
    if reste_global == 0:
        situation = "Critic"
    elif reste_global > 0:
        situation = "Good"
    else:
        situation = "Bad"

    return {
        "annee": annee,  # Utilisation de l'année envoyée
        "mois": mois,  # Utilisation du mois envoyé
        "revenuEstime": revenu_estime,
        "chargesEstimees": charges_estimees,
        "resteMensuel": reste_mensuel,
        "resteAnnuel": reste_annuel,
        "resteGlobal": reste_global,
        "situation": situation
    }



# Modification de la route Flask pour récupérer annee et mois depuis la requête
@app.route("/predict", methods=["GET"])
def predict():
    annee = request.args.get("annee")
    mois = request.args.get("mois")
    fondBanc = request.args.get("fondBanc")

    if not annee or not mois:
        return jsonify({"error": "L'année et le mois sont requis"}), 400

    prediction_result = train_and_predict(int(annee), int(mois),int(fondBanc))  # Conversion en entier
    return jsonify(prediction_result)

if __name__ == "__main__":
    app.run(port=5001, debug=False)