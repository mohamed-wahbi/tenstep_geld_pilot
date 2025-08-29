import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from '../MonthlyActivities.module.scss';
import axios from 'axios';
import { ToastContainer, toast, Bounce } from 'react-toastify';

interface LatestActivities {
  _id: string;
  year: string;
  month: string;
  bankFund: number;
  totalRevenue: number;
  totalExpenses: number;
  rest: number;
  globalRest: number;
  financialStatus: string;
  comment: string;
}

const Generate: React.FC = () => {
  const [generatMonthlyActivitiesTab, setGeneratMonthlyActivitiesTab] = useState(false);
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [bankFund, setBankFund] = useState<number | null>(null);
  const [facteurExterne, setFacteurExterne] = useState<number | null>(null);
  const [latestActivities, setLatestActivities] = useState<LatestActivities | null>(null);

  useEffect(() => {
    getLatest();
  }, []);

  // -------------------- Fetch Latest Financial Activity --------------------
  const getLatest = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3320/api/monthly-financial-activitie/latest");
      if (response.data.latestActivity) {
        setLatestActivities(response.data.latestActivity);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des activités financières:", error);
    }
  };

  // -------------------- Generate Monthly Financial Activity --------------------
  const generatedMonthlyActivitiesResults = async () => {
    if (!year || !month || bankFund === null) {
      notify("All inputs are required ⛔");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:3320/api/monthly-financial-activitie/create", {
        year,
        month,
        bankFund,
        facteurExterne
      });

      notify("Monthly Activities created successfully ✅");
      setBankFund(null);
      setYear("");
      setMonth("");
      setFacteurExterne(null);
      setGeneratMonthlyActivitiesTab(false);
      getLatest(); // Refresh latest activities
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        notify("Monthly Activities already exists ⛔");
      } else {
        notify("Monthly Activities created successfully ✅");
      }
      console.error("Erreur lors de la création de l'activité financière:", error);
    }
  };

  // -------------------- Notification Alert --------------------
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

  return (
    <div>
      <ToastContainer />

      {/* ---- Generate Monthly Activities Section ---- */}
      <div className={styles.HeaderTabelCtrl} style={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
        <div className={styles.generateRevenue}>
          <div className={styles.Top}>
            <p>Generate Monthly Activities</p>
            <button
              onClick={() => {
                setGeneratMonthlyActivitiesTab(!generatMonthlyActivitiesTab);
                setYear("");
                setMonth("");
                setFacteurExterne(null);
                setBankFund(null);
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
                  style={{ marginLeft: "15px" }}
                  placeholder="2025"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGenerateForm}>
                <label>Month</label>
                <input
                  placeholder="01 - 12"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGenerateForm}>
                <label>Bank Fund</label>
                <input
                  placeholder="1000"
                  value={bankFund ?? ""}
                  type="number"
                  onChange={(e) => setBankFund(Number(e.target.value))}
                  required
                />
              </div>


              <div className={styles.inputGenerateForm}>
                <label>External Bad Facts</label>
                <input
                  placeholder="1 or 2.."
                  value={facteurExterne ?? ""}
                  type="number"
                  onChange={(e) => setFacteurExterne(Number(e.target.value))}
                  required
                />
              </div>

              <div className={styles.btnContent}>
                <button style={{ border: "none" }} onClick={generatedMonthlyActivitiesResults}>
                  ➕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Latest Financial Activity Table ---- */}
      <div className={styles.TableContent} >
        <p>The Last Generated Monthly Financial Activities:</p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Year</th>
              <th>Month</th>
              <th>Bank Fund</th>
              <th>Total Revenue</th>
              <th>Total Expenses</th>
              <th>Rest</th>
              <th>Global Rest</th>
              <th>Financial Status</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {latestActivities ? (
              <tr>
                <td>{latestActivities.year}</td>
                <td>{latestActivities.month}</td>
                <td>{latestActivities.bankFund}</td>
                <td>{latestActivities.totalRevenue}</td>
                <td>{latestActivities.totalExpenses}</td>
                <td>{latestActivities.rest}</td>
                <td>{latestActivities.globalRest}</td>
                <td>{latestActivities.financialStatus}</td>
                <td>{latestActivities.comment}</td>
              </tr>
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: "center" }}>No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Generate;
