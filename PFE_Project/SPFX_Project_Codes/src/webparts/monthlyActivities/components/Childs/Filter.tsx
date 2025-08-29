import * as React from 'react';
import { useState } from 'react';
import styles from '../MonthlyActivities.module.scss';
import Accordion from 'react-bootstrap/Accordion';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const Filter: React.FC = () => {
  const [year, setYear] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [generatMonthlyActivitiesTab, setGeneratMonthlyActivitiesTab] = useState(false);
  const [monthActivitie, setMonthActivitie] = useState<any>(null);

  const filtredMonthlyActivitiesResults = async () => {
    try {
      const response = await axios.post(`http://127.0.0.1:3320/api/monthly-financial-activitie/getOne`, {
        year: year,
        month: month
      });
      setMonthActivitie(response.data.getOneMonthlyActivitie);
      setYear("");
      setMonth("");
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
            <p>Filter Monthly Activities</p>
            <button onClick={() => {
              setGeneratMonthlyActivitiesTab(!generatMonthlyActivitiesTab);
              setYear("");
              setMonth("");
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
              <div className={styles.inputGenerateForm}>
                <label>Month</label>
                <input
                  placeholder="01 - 12"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                />
              </div>
              <div className={styles.btnContent}>
                <button style={{ border: "none" }} onClick={filtredMonthlyActivitiesResults}>
                  ➕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {monthActivitie ? (
        <div>
          <div className={styles.DataLineContent}>
            <div className={styles.DataLine}><p>Year :</p> <span>{monthActivitie.year}</span></div>
            <div className={styles.DataLine}><p>Month :</p> <span>{monthActivitie.month}</span></div>
            <div className={styles.DataLine}><p>Bank Fund :</p> <span>{monthActivitie.bankFund}</span></div>
            <div className={styles.DataLine}><p>Total Revenue :</p> <span>{monthActivitie.totalRevenue}</span></div>
            <div className={styles.DataLine}><p>Total Expenses :</p> <span>{monthActivitie.totalExpenses}</span></div>
            <div className={styles.DataLine}><p>Rest :</p> <span>{monthActivitie.rest}</span></div>
            <div className={styles.DataLine}><p>Global Rest :</p> <span>{monthActivitie.globalRest}</span></div>
            <div className={styles.DataLine}><p>Financial Status :</p> <span>{monthActivitie.financialStatus}</span></div>
            <div className={styles.DataLine}><p>Comment :</p> <span>{monthActivitie.comment}</span></div>
          </div>
          <div className={styles.accordionContent}>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header><p>Revenue List</p></Accordion.Header>
                <Accordion.Body>
                  <div className={styles.TableContent}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Month</th>
                          <th>Client</th>
                          <th>Invoices Paid</th>
                          <th>Total Paid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthActivitie.revenuesList.map((rev: any) => (
                          <tr key={rev._id}>
                            <td>{rev.year}</td>
                            <td>{rev.month}</td>
                            <td>{rev.nomClient}</td>
                            <td>{rev.nombreFacturesPayees}</td>
                            <td>{rev.montantTotalPaye}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header><p>Expenses List</p></Accordion.Header>
                <Accordion.Body>
                  <div className={styles.TableContent}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Month</th>
                          <th>Expense Type</th>
                          <th>Charge Number</th>
                          <th>Total Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthActivitie.expensesList.map((exp: any) => (
                          <tr key={exp._id}>
                            <td>{exp.year}</td>
                            <td>{exp.month}</td>
                            <td>{exp.expenseType}</td>
                            <td>{exp.totalCharges}</td>
                            <td>{exp.totalAmount}</td>
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
