import * as React from 'react';
import "aos/dist/aos.css";
import styles from "../../components/Prediction.module.scss";
import { useEffect, useState } from 'react';
import axios from 'axios';
const { VocaFlexMWSTn } = require('vecoflextnmws')
import { MdDeleteOutline } from "react-icons/md";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';





interface PredictionResult {
  _id: string;
  annee: number
  mois: number;
  revenuEstime: number;
  chargesEstimees: number;
  resteMensuel: number;
  resteAnnuel: number;
  resteGlobal: number;
  situation: string;
  createdAt: string;

}






const PredictionHistory: React.FC = () => {
  const [predictionResltData, setPredictionResltData] = useState<PredictionResult[]>([]); // ✅ Ajout du type Client[]


  useEffect(() => {
    fetchPredictionResults();
  }, []);


  // -----------------------------Get All Predictions--------------------------------------------
  const fetchPredictionResults = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3320/api/prediction/get_all_result");
      setPredictionResltData(response.data); // ✅ Forçage du type si nécessaire
    } catch (error) {
      console.error("Erreur in fetching of prediction results", error);
    }
  };
  // _________________________________________________________________________________________


    // -----------------------------Delete One Prediction--------------------------------------------
    const DeleteOnePredictionResult = async (id: string) => {
      try {
        await axios.delete(`http://127.0.0.1:3320/api/prediction/deleteOne/${id}`);
        fetchPredictionResults()
        notify('Client deleted successfully . ✅')
      } catch (error) {
        console.error("Erreur in delete of client !", error);
      }
    };
    // _________________________________________________________________________________________
  
  




    // -----------------------Filter System--------------------------------
    const [allFiltredDatas, setAllFiltredDatas] = useState<PredictionResult[]>([])
    const [oneFiltredData, setOneFiltredData] = useState<PredictionResult | null>(null)
  
    console.log(allFiltredDatas);// liste des données filtre
  
    console.log(oneFiltredData)// un ligne de la liste des données filtré
  
  
    const getAllFiltredDatas = (data: PredictionResult[]) => { setAllFiltredDatas(data) }
    const getOneFiltredData = (data: PredictionResult) => { setOneFiltredData(data) }
    // ___________________________________________________________________
  
  



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
  
  
  return (
    <div className={styles.tableContainer}>
      <ToastContainer />
      <div className={styles.HeaderTabelCtrl}>
        <div className={styles.searchInput}>
          <VocaFlexMWSTn
            data={predictionResltData}
            keys={["annee", "mois"]}
            lang={"en-US"}
            threshold={"0.4"}
            allFiltredDatas={getAllFiltredDatas}
            oneFiltredData={getOneFiltredData}
            titre={"annee"}
            description={"mois"}
          />

        </div>

      <div className={styles.TableContent} style={{marginTop:"50px"}}>
        <table  className={styles.table}>
          <thead>
            <tr>
              <th>Controls</th>
              <th> Year</th>
              <th> Month</th>
              <th> Estimated Revenue</th>
              <th> Estimated Expenses</th>
              <th> Monthly Balance</th>
              <th> Annual Balance</th>
              <th> Total Balance</th>
              <th> Status</th>
              <th> Created At</th>
            </tr>
          </thead>

          <tbody>
            {(allFiltredDatas.length !=0 ? allFiltredDatas : predictionResltData).map((result)=> (
              <tr key={result._id}>
                <td className={styles.ctrlCl}>
                  <span>⚙️</span>
                  <div className={styles.ctrlBtn}>
                    <MdDeleteOutline className={styles.deleteLogo} onClick={() => DeleteOnePredictionResult(result._id)} />
                  </div>
                </td>
                <td>🗓️ {result.annee} </td>
                <td>🗓️ {result.mois} </td>
                <td>💷 {result.chargesEstimees} </td>
                <td>💷 {result.revenuEstime} </td>
                <td>💷 {result.resteMensuel} </td>
                <td>💷 {result.resteAnnuel} </td>
                <td>💷 {result.resteGlobal} </td>
                <td>🤔 {result.situation} </td>
                <td>⏱️ {formatDate(result.createdAt)} </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>

    </div>
  );
};

export default PredictionHistory;
