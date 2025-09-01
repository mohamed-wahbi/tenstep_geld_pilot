import * as React from 'react';
import { useState, useEffect } from 'react'
import styles from '../../components/Historys.module.scss';
const { VocaFlexMWSTn } = require('vecoflextnmws')
const AOS = require("aos");
import "aos/dist/aos.css";
import axios from 'axios';


interface InvoiceHistory {
  _id: string,
  id_client: string,
  clientName: string,
  montantInitial: string,
  remise: string,
  montantApresRemise: string,
  montantPaye: string,
  datePaiementEntreprise: string,
  datePaiementClient: string,
  statut: string,
  commentairePaiement: string,
  createdAt: string
}

const InvoiceHistoryTab: React.FC = () => {
  const [invoiceHistoryData, setInvoiceHistoryData] = useState<InvoiceHistory[]>([])

  useEffect(() => {
    featchingInvoiceHistory()
  }, [])

  const featchingInvoiceHistory = async () => {
    try {
      const HistoryDatas = await axios.get("http://127.0.0.1:3320/api/invoice-history/getAll")
      setInvoiceHistoryData(HistoryDatas.data.invoiceHistoryData)

      // setInvoiceHistoryData(res)
    } catch (error) {
      console.log("Error of featching invoice History datas!")
    }
  }



  // -----------------------Filter System--------------------------------
  const [allFiltredDatas, setAllFiltredDatas] = useState<InvoiceHistory[]>([])
  const [oneFiltredData, setOneFiltredData] = useState<InvoiceHistory | null>(null)

  console.log(allFiltredDatas);// liste des données filtre

  console.log(oneFiltredData)// un ligne de la liste des données filtré


  const getAllFiltredDatas = (data: InvoiceHistory[]) => { setAllFiltredDatas(data) }
  const getOneFiltredData = (data: InvoiceHistory) => { setOneFiltredData(data) }
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
            data={invoiceHistoryData}
            keys={["clientName"]}
            lang={"en-US"}
            threshold={"0.4"}
            allFiltredDatas={getAllFiltredDatas}
            oneFiltredData={getOneFiltredData}
            titre={"clientName"}
            description={"commentairePaiement"}
          />

        </div>
      </div>

      <div className={styles.TableContent}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Initial Amount</th>
              <th>Discount (%)</th>
              <th>Amount After Discount</th>
              <th>Paid Amount</th>
              <th>Company Payment Date</th>
              <th>Client Last Payment Date</th>
              <th>Payment Comment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(allFiltredDatas.length > 0 ? allFiltredDatas : invoiceHistoryData).map((invoice) => {
              return (
                <tr key={invoice._id}>
                  <td > {invoice.clientName} </td>
                  <td  style={{textAlign:"end"}}> {invoice.montantInitial} </td>
                  <td  style={{textAlign:"end"}}> {invoice.remise} </td>
                  <td  style={{textAlign:"end"}}> {invoice.montantApresRemise} </td>
                  <td  style={{textAlign:"end"}}> {invoice.montantPaye} </td>
                  <td  style={{textAlign:"center"}}> {formatDateTime(invoice.datePaiementEntreprise)} </td>
                  <td  style={{textAlign:"center"}}> {formatDateTime(invoice.datePaiementClient)} </td>
                  <td> {invoice.commentairePaiement} </td>
                  <td> {invoice.statut} </td>
                </tr>
              )
            })}



          </tbody>
        </table>
      </div>


    </div>
  );
};

export default InvoiceHistoryTab;
