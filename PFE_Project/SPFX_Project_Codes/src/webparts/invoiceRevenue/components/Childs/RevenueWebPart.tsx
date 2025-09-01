import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from '../../components/InvoiceRevenue.module.scss';
import { ToastContainer, toast, Bounce } from 'react-toastify';
const AOS = require("aos");
import "aos/dist/aos.css";
import axios from 'axios';
const { VocaFlexMWSTn } = require('vecoflextnmws')





interface Revenue {
  _id: string,
  id_client: string,
  year: string,
  month: string,
  nomClient: string,
  nombreFacturesPayees: string,
  montantTotalPaye: string,
  createdAt: string,
}

const RevenueWebPart: React.FC = () => {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [generatRevenueTab, setGeneratRevenueTab] = useState(false);
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")

  // Featching Data 
  useEffect(() => {
    FeatchingRevenues()
  }, [])

  // -----------------------Filter System--------------------------------
  const [allFiltredDatas, setAllFiltredDatas] = useState<Revenue[]>([])
  const [oneFiltredData, setOneFiltredData] = useState<Revenue | null>(null)

  console.log(allFiltredDatas);// liste des données filtre

  console.log(oneFiltredData)// un ligne de la liste des données filtré


  const getAllFiltredDatas = (data: Revenue[]) => { setAllFiltredDatas(data) }
  const getOneFiltredData = (data: Revenue) => { setOneFiltredData(data) }
  // ___________________________________________________________________



  // -------------------------Featching Revenue--------------------------------
  const FeatchingRevenues = async () => {
    try {
      const revenuesData = await axios.get("http://127.0.0.1:3320/api/revenue/getAll")
      console.log(revenuesData.data);
      setRevenues(revenuesData.data.revenues)
    } catch (error) {
      console.log("Error Featching Revenues from DB !")
    }
  }
  // ___________________________________________________________________________



  // ------------------------------generatedRevenue Function---------------------------------
  const generatedRevenue = async (year: string, month: string) => {
    try {
      setYear(year);
      setMonth(month);
      await axios.post(`http://127.0.0.1:3320/api/revenue/generate/${year}/${month}`)
      notify("Revenues Generated successfuly. ✅")
      FeatchingRevenues()
      setYear("");
      setMonth("");
      setGeneratRevenueTab(false)
    } catch (error) {
      setYear("");
      setMonth("");
      notify("Please choose an existing year and month ⛔")
      notify("year and month format: YYYY-MM 😉")

    }
  }

  // ___________________________________________________________________________________________




  // ------------------------------generatedRevenue Function---------------------------------
  const confirmeMonthRevenue = async () => {
    try {

      await axios.post(`http://127.0.0.1:3320/api/revenue/confirme`)
      setRevenues([])
      FeatchingRevenues()
      notify("Revenues of this monthe are Confirmed successfuly. ✅")


    } catch (error) {

      notify("Please try agan ! ⛔")


    }
  }

  // ___________________________________________________________________________________________


  // ----------------------------------Notif Alert---------------------------------
  const notify = (text: string) => toast(text, {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
    transition: Bounce,
  });
  // _______________________________________________________________________________



  React.useEffect(() => {
    AOS.init({ duration: 1500, once: true });
  }, []);

  return (
    <div className={styles.tableContainer}>
      <ToastContainer />

      <div className={styles.HeaderTabelCtrl}>

        <div className={styles.searchInput}>
          <VocaFlexMWSTn
            data={revenues}
            keys={["year", "month", "nomClient"]}
            lang={"en-US"}
            threshold={"0.4"}
            allFiltredDatas={getAllFiltredDatas}
            oneFiltredData={getOneFiltredData}
            titre={"nomClient"}
            description={""}
          />
        </div>

        <div className={styles.generateRevenue}>
          <div className={styles.Top}>
            <p>Generat Revenue</p>
            <button
              onClick={() => {
                setGeneratRevenueTab(!generatRevenueTab);
                setYear("");
                setMonth("");
              }}
            >
              {generatRevenueTab ? "❌" : "🆕"}
            </button>
          </div>

          {generatRevenueTab && (
            <div className={styles.GenerateForm}>
              <div className={styles.inputGenerateForm}>
                <label>Year</label>
                <input
                  style={{ marginLeft: "15px" }}
                  placeholder='2025'
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      generatedRevenue(year, month);
                    }
                  }}
                  required
                />
              </div>

              <div className={styles.inputGenerateForm}>
                <label>Month</label>
                <input
                  placeholder='01 - 12'
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      generatedRevenue(year, month);
                    }
                  }}
                  required
                />
              </div>

              <div className={styles.btnContent}>
                <button
                  style={{ border: "none" }}
                  onClick={() => generatedRevenue(year, month)}
                >
                  ➕
                </button>
              </div>
            </div>
          )}
        </div>


      </div>

      {revenues.length > 0 ? <div>
        <button onClick={confirmeMonthRevenue} className={styles.confirmeRevenuesBtn}>✅ Confirme All Revenues</button>
      </div> : null}



      <div className={styles.TableContent} >
        <table className={styles.table}>
          <thead>
            <th>Year</th>
            <th>Month</th>
            <th>Client</th>
            <th>nombre Factures Payees</th>
            <th>montant Total Paye</th>
          </thead>
          <tbody>
            {
              (allFiltredDatas.length > 0 ? allFiltredDatas : revenues).map((revenue) => {
                return (
                  <tr key={revenue._id}>
                    <td style={{ textAlign: "center" }}>{revenue.year} </td>
                    <td style={{ textAlign: "center" }}>{revenue.month} </td>
                    <td style={{ fontWeight: "500", textAlign: "start" }}>{revenue.nomClient} </td>
                    <td style={{ textAlign: "end" }}>{revenue.nombreFacturesPayees} </td>
                    <td style={{ textAlign: "end" }}>{revenue.montantTotalPaye}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueWebPart;
