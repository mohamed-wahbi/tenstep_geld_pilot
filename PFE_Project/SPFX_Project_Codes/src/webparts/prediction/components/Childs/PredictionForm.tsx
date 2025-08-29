import * as React from "react";
import "aos/dist/aos.css";
import styles from "../../components/Prediction.module.scss";
import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Accordion from "react-bootstrap/Accordion";
import "bootstrap/dist/css/bootstrap.min.css";

// Import Chart.js
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from "chart.js";

// Enregistrer les composants pour Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

interface PredictionResult {
  _id: string;
  annee: number;
  mois: number;
  revenuEstime: number;
  chargesEstimees: number;
  resteMensuel: number;
  resteAnnuel: number;
  resteGlobal: number;
  situation: string;
  createdAt: string;
}

const PredictionForm: React.FC = () => {
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [fondBanc, setFondBanc] = useState<number | null>(null);
  const [generatMonthlyActivitiesTab, setGeneratMonthlyActivitiesTab] =
    useState(false);
  const [predictionResltData, setPredictionResltData] =
    useState<PredictionResult | null>(null);

  useEffect(() => {
    fetchPredictionResults();
  }, []);

  const fetchPredictionResults = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:3320/api/prediction/get_last_result"
      );
      if (response.data) {
        setPredictionResltData(response.data);
      } else {
        notify("No prediction data found ⚠️");
      }
    } catch (error) {
      console.error("Error fetching prediction results", error);
      notify("Error fetching prediction results ❌");
    }
  };

  const generatePrediction = async () => {
    if (year === null || month === null) {
      notify("Please enter both Year and Month ⚠️");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:3320/api/prediction/create",
        {
          annee: year,
          mois: month,
          fondBanc:fondBanc
        }
      );

      if (response.status === 200) {
        notify("Prediction generated successfully ✅");
        fetchPredictionResults();
      }
    } catch (error) {
      console.error("Error generating prediction:", error);
      notify("Error generating prediction ❌");
    }
  };

  const notify = (text: string) =>
    toast(text, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Bounce,
    });

  // Préparer les données pour les graphiques
  const barChartData = {
    labels: ["Estimated Revenue", "Estimated Charges"],
    datasets: [
      {
        label: "Amount",
        data: predictionResltData
          ? [predictionResltData.revenuEstime, predictionResltData.chargesEstimees]
          : [0, 0],
        backgroundColor: ["#4CAF50", "#FF5733"],
      },
    ],
  };

  const lineChartData = {
    labels: ["Monthly Remaining", "Annual Remaining", "Global Remaining"],
    datasets: [
      {
        label: "Remaining Amount",
        data: predictionResltData
          ? [
            predictionResltData.resteMensuel,
            predictionResltData.resteAnnuel,
            predictionResltData.resteGlobal,
          ]
          : [0, 0, 0],
        fill: false,
        borderColor: "#007BFF",
        tension: 0.4,
      },
    ],
  };



  //-------------------------------Format Date-----------------------------
  const pad = (n: number) => (n < 10 ? '0' + n : n.toString());

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Les mois commencent à 0
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  // ______________________________________________________________________________




  return (
    <div>
      <ToastContainer />
      <div
        className={styles.HeaderTabelCtrl}
        style={{ display: "flex", justifyContent: "end", alignItems: "center" }}
      >
        <div className={styles.generateRevenue}>
          <div className={styles.Top}>
            <p>Generate Predictions</p>
            <button
              onClick={() => {
                setGeneratMonthlyActivitiesTab(!generatMonthlyActivitiesTab);
                setYear(null);
                setMonth(null);
                setFondBanc(null)
              }}
            >
              {generatMonthlyActivitiesTab ? "❌" : "🆕"}
            </button>
          </div>
          {generatMonthlyActivitiesTab && (
            <div className={styles.GenerateForm}>
              <div className={styles.inputGenerateForm}>
                <label>Year</label>
                <input
                  type="number"
                  style={{ marginLeft: "15px" }}
                  placeholder="2025"
                  value={year ?? ""}
                  onChange={(e) => setYear(Number(e.target.value))}
                  required
                />
              </div>
              <div className={styles.inputGenerateForm}>
                <label>Month</label>
                <input
                  type="number"
                  placeholder="01 - 12"
                  value={month ?? ""}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  min={1}
                  max={12}
                  required
                />
              </div>

              <div className={styles.inputGenerateForm}>
                <label>Fond Bank</label>
                <input
                  type="number"
                  placeholder="10000"
                  value={fondBanc ?? ""}
                  onChange={(e) => setFondBanc(Number(e.target.value))}
                  required
                />
              </div>
              <div className={styles.btnContent}>
                <button style={{ border: "none" }} onClick={generatePrediction}>
                  ➕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {predictionResltData ? (
        <div>
          <div className={styles.DataLineContent}>
            <div className={styles.DataLine}><p>Year :</p> <span>{predictionResltData.annee}</span></div>
            <div className={styles.DataLine}><p>Month :</p> <span>{predictionResltData.mois}</span></div>
            <div className={styles.DataLine}><p>Estimated Revenue :</p> <span>{predictionResltData.revenuEstime}</span></div>
            <div className={styles.DataLine}><p>Estimated Charges :</p> <span>{predictionResltData.chargesEstimees}</span></div>
            <div className={styles.DataLine}><p>Monthly Remaining :</p> <span>{predictionResltData.resteMensuel}</span></div>
            <div className={styles.DataLine}><p>Annual Remaining :</p> <span>{predictionResltData.resteAnnuel}</span></div>
            <div className={styles.DataLine}><p>Global Remaining :</p> <span>{predictionResltData.resteGlobal}</span></div>
            <div className={styles.DataLine}><p>Financial Status :</p> <span>{predictionResltData.situation}</span></div>
            <div className={styles.DataLine}><p>Created At :</p> <span>{formatDate(predictionResltData.createdAt)}</span></div>
          </div>

          <div className={styles.accordionContent}>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header><p>Revenue & Expenses Charts</p></Accordion.Header>
                <Accordion.Body>
                  <div className={styles.TableContent} style={{display:"flex",flexDirection:"column",alignItems: "center"}}>
                  <h4>Revenue vs Charges</h4>
                  <Bar data={barChartData} style={{marginBottom:"20px"}} />

                  <h4>Remaining Balances Over Time</h4>
                  <Line data={lineChartData} style={{marginBottom:"10px"}}  />
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
        </div>
  ) : (
    <p style={{ color: "red" }}>No prediction result in the DB !</p>
  )
}
    </div >
  );
};

export default PredictionForm;
