import * as React from 'react';
import { useState } from 'react';
import styles from '../AnnualActivities.module.scss';
import Accordion from 'react-bootstrap/Accordion';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const Filter: React.FC = () => {
  const [year, setYear] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [generatMonthlyActivitiesTab, setGeneratMonthlyActivitiesTab] = useState(false);
  const [AnnualActivitie, setAnnualActivitie] = useState<any>(null);

  const filtredAnnualActivitiesResults = async () => {
    try {
      const response = await axios.post(`http://127.0.0.1:3320/api/annual-financial-activitie/getOne`, {
        year: year,
      });
      setAnnualActivitie(response.data.getOneAnnualActivitie);
      setYear("");
      setGeneratMonthlyActivitiesTab(false)
      setErrorMsg("")
    } catch (error) {
      console.log(error);
      setErrorMsg("No result with this date!")
    }
  };

  return (
    <div>
      <div className={styles.HeaderTabelCtrl} style={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
        <div className={styles.generateRevenue}>
          <div className={styles.Top}>
            <p>Filter Annual Activities</p>
            <button onClick={() => {
              setGeneratMonthlyActivitiesTab(!generatMonthlyActivitiesTab);
              setYear("");
            }}>
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
              <div className={styles.btnContent}>
                <button style={{ border: "none" }} onClick={filtredAnnualActivitiesResults}>
                  ➕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {AnnualActivitie ? (
        <div>
          <div className={styles.DataLineContent}>
            <div className={styles.DataLine}><p>Year :</p> <span>{AnnualActivitie.year}</span></div>
            <div className={styles.DataLine}><p>Bank Fund :</p> <span>{AnnualActivitie.bankFund}</span></div>
            <div className={styles.DataLine}><p>Total Revenue :</p> <span>{AnnualActivitie.totalRevenue}</span></div>
            <div className={styles.DataLine}><p>Total Expenses :</p> <span>{AnnualActivitie.totalExpenses}</span></div>
            <div className={styles.DataLine}><p>Rest :</p> <span>{AnnualActivitie.rest}</span></div>
            <div className={styles.DataLine}><p>Global Rest :</p> <span>{AnnualActivitie.globalRest}</span></div>
            <div className={styles.DataLine}><p>Financial Status :</p> <span>{AnnualActivitie.financialStatus}</span></div>
            <div className={styles.DataLine}><p>Comment :</p> <span>{AnnualActivitie.comment}</span></div>
          </div>
          <div className={styles.accordionContent}>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header><p>Annual Financial Activities List</p></Accordion.Header>
                <Accordion.Body>
                  <div className={styles.TableContent}>
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
                        {AnnualActivitie.monthlyFinancialActivitiesList.map((rev: any) => (
                          <tr key={rev._id}>
                            <td>{rev.year}</td>
                            <td>{rev.month}</td>
                            <td>{rev.bankFund}</td>
                            <td>{rev.totalRevenue}</td>
                            <td>{rev.totalExpenses}</td>
                            <td>{rev.rest}</td>
                            <td>{rev.globalRest}</td>
                            <td>{rev.financialStatus}</td>
                            <td>{rev.comment}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        </div>
      ):<p style={{color:"red"}}>{errorMsg}</p>}
    </div>
  );
};

export default Filter;
