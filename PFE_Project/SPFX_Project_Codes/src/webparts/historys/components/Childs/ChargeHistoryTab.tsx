import * as React from 'react';
import { useState, useEffect } from 'react'
import styles from '../../components/Historys.module.scss';
const { VocaFlexMWSTn } = require('vecoflextnmws')
const AOS = require("aos");
import "aos/dist/aos.css";
import axios from 'axios';








interface ChargeHistory {
  _id: string,
  month: string,
  year: string,
  expenseName: string,
  estimatedAmount: string,
  actualAmount: string,
  chargeStatus: string,
  covredDay: string,
  expenseType: string,
  createdAt: string
}

const ChargeHistoryTab: React.FC = () => {
  const [chargeHistoryData, setChargeHistoryData] = useState<ChargeHistory[]>([])

  useEffect(() => {
    featchingChargeHistory()
  }, [])

  const featchingChargeHistory = async () => {
    try {
      const HistoryDatas = await axios.get("http://127.0.0.1:3320/api/monthly-expense-history/getAll")
      setChargeHistoryData(HistoryDatas.data.monthlyExpenseHistory)

      // setInvoiceHistoryData(res)
    } catch (error) {
      console.log("Error of featching Charge History datas!")
    }
  }



  // -----------------------Filter System--------------------------------
  const [allFiltredDatas, setAllFiltredDatas] = useState<ChargeHistory[]>([])
  const [oneFiltredData, setOneFiltredData] = useState<ChargeHistory | null>(null)

  console.log(allFiltredDatas);// liste des données filtre

  console.log(oneFiltredData)// un ligne de la liste des données filtré


  const getAllFiltredDatas = (data: ChargeHistory[]) => { setAllFiltredDatas(data) }
  const getOneFiltredData = (data: ChargeHistory) => { setOneFiltredData(data) }
  // ___________________________________________________________________



  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Not Paid";
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
  };


  React.useEffect(() => {
    AOS.init({ duration: 1500, once: true });
  }, []);

  return (
    <div className={styles.tableContainer}>

      <div className={styles.HeaderTabelCtrl}>
        <div className={styles.searchInput}>
          <VocaFlexMWSTn
            data={chargeHistoryData}
            keys={["expenseName", "expenseType", "year", "month", "chargeStatus"]}
            lang={"en-US"}
            threshold={"0.4"}
            allFiltredDatas={getAllFiltredDatas}
            oneFiltredData={getOneFiltredData}
            titre={"expenseName"}
            description={"expenseType"}
          />

        </div>
      </div>

      <div className={styles.TableContent}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Year</th>
              <th>Month</th>
              <th>Expense Name</th>
              <th>Expense Type</th>
              <th>Estimated Amount</th>
              <th>Actual Amount</th>
              <th>Charge Status</th>
              <th>Covred Day</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {(allFiltredDatas.length > 0 ? allFiltredDatas : chargeHistoryData).map((charge) => {
              return (
                <tr key={charge._id}>
                  <td style={{textAlign:"center"}}> {charge.year} </td>
                  <td style={{textAlign:"center"}}> {charge.month} </td>
                  <td> {charge.expenseName} </td>
                  <td> {charge.expenseType} </td>
                  <td style={{textAlign:"end"}}> {charge.estimatedAmount} </td>
                  <td style={{textAlign:"end"}}> {charge.actualAmount} </td>
                  <td> {charge.chargeStatus} </td>
                  <td style={{textAlign:"center"}}> {charge.covredDay} </td>
                  <td style={{textAlign:"center"}}> {formatDateTime(charge.createdAt)} </td>
                </tr>
              )
            })}



          </tbody>
        </table>
      </div>


    </div>
  );
};

export default ChargeHistoryTab;
