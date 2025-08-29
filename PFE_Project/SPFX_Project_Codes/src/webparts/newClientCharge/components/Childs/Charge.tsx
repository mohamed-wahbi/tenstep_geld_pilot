import * as React from 'react';
import { useEffect, useState } from 'react'; const AOS = require("aos");
import "aos/dist/aos.css";
import styles from "../../components/NewClientCharge.module.scss";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { MdDeleteOutline } from "react-icons/md";
import { HiOutlineWrench } from "react-icons/hi2";
const { VocaFlexMWSTn } = require('vecoflextnmws')




interface Charge {
  _id: string;
  expenseName: string
  expenseType: string;
  amount: string;
  status: string;
  paymentDay: string;
  createdAt: string;
}




const Charge: React.FC = () => {

  const [charges, setCharges] = useState<Charge[]>([]); // ✅ Ajout du type Client[]
  const [editableRow, setEditableRow] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Charge>>({});
  const [originalData, setOriginalData] = useState<Partial<Charge>>({});

  useEffect(() => {
    fetchCharges();
  }, []);


  // -----------------------------Get All Clients--------------------------------------------
  const fetchCharges = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3320/api/expense-fix/getAll");
      console.log(response.data)
      setCharges(response.data.Expenses_Fixs); // ✅ Forçage du type si nécessaire
    } catch (error) {
      console.error("Erreur in fetching of charges :", error);
    }
  };
  // _________________________________________________________________________________________





  // -----------------------------Delete One Charges--------------------------------------------
  const DeleteOneCharge = async (id: string) => {
    try {
      await axios.delete(`http://127.0.0.1:3320/api/expense-fix/deleteOne/${id}`);
      fetchCharges()
      notify('Charge deleted successfully . ✅')
    } catch (error) {
      console.error("Erreur in delete of charge !", error);
    }
  };
  // _________________________________________________________________________________________





  // -----------------------------Update One Client--------------------------------------------
  // Mettre à jour un client
  const updateCharges = async (id: string, updatedData: Partial<Charge>) => {
    if (Object.keys(updatedData).length === 0) {
      setEditableRow(null)
      notify("No changes detected ! 🤔");
      return;
    }
    try {
      await axios.put(`http://127.0.0.1:3320/api/expense-fix/updateOne/${id}`, updatedData);
      // notify("Charge updated successfully ! ✅");
      fetchCharges();
      setEditableRow(null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du charge :", error);
      notify("Erreur lors de la mise à jour du charge !");
    }
  };

  const handleEditClick = (client: Charge) => {
    setEditableRow(client._id);
    setOriginalData(client);
    setEditedData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Charge) => {
    const value = e.target.value;
    if (value !== originalData[field]) {
      setEditedData((prev) => ({ ...prev, [field]: value }));
    } else {
      setEditedData((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSave = () => {
    if (editableRow) {
      updateCharges(editableRow, editedData);
    }
  };
  // _________________________________________________________________________________________

  // -----------------------Filter System--------------------------------
  const [allFiltredDatas, setAllFiltredDatas] = useState<Charge[]>([])
  const [oneFiltredData, setOneFiltredData] = useState<Charge | null>(null)

  console.log(allFiltredDatas);// liste des données filtre

  console.log(oneFiltredData)// un ligne de la liste des données filtré


  const getAllFiltredDatas = (data: Charge[]) => { setAllFiltredDatas(data) }
  const getOneFiltredData = (data: Charge) => { setOneFiltredData(data) }
  // ___________________________________________________________________





  // ------------------------------Create Client------------------------------------------------
  const [newChargeData, setNewChargeData] = useState<Partial<Charge> | null>(null);

  // Création d'un nouveau client (affichage d'une ligne vide)
  const createNewCharge = () => {
    setNewChargeData({
      expenseName: "",
      expenseType: "Payroll",
      amount: "",
      status: "Fixed",
      paymentDay: "",
    });
  };

  // Mise à jour des données du nouveau client
  const handleNewChargeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof Charge
  ) => {
    setNewChargeData((prev) =>
      prev ? { ...prev, [field]: e.target.value } : null
    );
  };

  // Sauvegarde du nouveau client
  const saveNewCharge = async () => {
    if (!newChargeData || !newChargeData.expenseName || !newChargeData.expenseType || !newChargeData.amount || !newChargeData.status) {
      notify("Veuillez remplir tous les champs obligatoires ! ⛔");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:3320/api/expense-fix/create", newChargeData)

      notify("Charge Created successfully. ✅");
      fetchCharges();
      setNewChargeData(null);
      // reloading page 
    } catch (error) {
      console.error("Erreur lors de la création du charge :", error);
      notify("Erreur of creation charge! ⛔");
    }
  };

  // _____________________________________________________________________________________________

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




  // ---------------------------Reload Btn----------------------------------
  const reloadChargesDatas = () => {
    fetchCharges()
    notify("All charges reloaded from the Data Base. ✅")
  }
  // _______________________________________________________________________




  React.useEffect(() => {
    AOS.init({ duration: 1500, once: true });
  }, []);

  return (
    <div className={styles.tableContainer}>
      <ToastContainer />

      <div className={styles.HeaderTabelCtrl}>
        <div className={styles.searchInput}>
          <VocaFlexMWSTn
            data={charges}
            keys={["expenseName", "expenseType", "status"]}
            lang={"en-US"}
            threshold={"0.4"}
            allFiltredDatas={getAllFiltredDatas}
            oneFiltredData={getOneFiltredData}
            titre={"expenseName"}
            description={"expenseType"}
          />

        </div>

        <div className={styles.ctrlTabBtns}>
          <button onClick={createNewCharge}>🆕</button>
          <button onClick={reloadChargesDatas}>🔄️</button>
        </div>
      </div>

      <div className={styles.TableContent}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Controls</th>
              <th>Expense Name</th>
              <th>Expense Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment Day</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>

            {/* Ligne pour ajouter un nouveau client en haut du tableau */}
            {newChargeData && (
              <tr>
                <td>➕</td>
                <td>
                  <input className={styles.CreateInput} type="text" value={newChargeData.expenseName} onChange={(e) => handleNewChargeChange(e, "expenseName")} />
                </td>
                <td>
                  <select value={newChargeData.expenseType} onChange={(e) => handleNewChargeChange(e, "expenseType")}>
                    <option>Payroll</option>
                    <option>Admin</option>
                    <option>Training</option>
                    <option>Marketing</option>
                    <option>Travel</option>
                    <option>HR</option>
                    <option>Other</option>
                  </select>
                </td>

                <td>
                  <input className={styles.CreateInput} type="text" value={newChargeData.amount} onChange={(e) => handleNewChargeChange(e, "amount")} />
                </td>


                <td>
                  <select value={newChargeData.status} onChange={(e) => handleNewChargeChange(e, "status")}>
                    <option>Fixed</option>
                    <option>Variable</option>
                  </select>
                </td>


                <td>
                  <input className={styles.CreateInput} type="text" value={newChargeData.paymentDay} onChange={(e) => handleNewChargeChange(e, "paymentDay")} />
                </td>

                <td>
                  Created Date auto
                </td>

                <td className={styles.CreateRowStyle}>
                  <button style={{ border: "none", cursor: "pointer", background: "transparent" }} onClick={saveNewCharge}>💾</button>
                  <button style={{ border: "none", cursor: "pointer", background: "transparent" }} onClick={() => setNewChargeData(null)}>❌</button>
                </td>
              </tr>
            )}






            {(allFiltredDatas.length != 0 ? allFiltredDatas : charges).map((charge) => (
              <tr key={charge._id}>
                <td className={styles.ctrlCl}>
                  <span>⚙️</span>
                  <div className={styles.ctrlBtn}>
                    <MdDeleteOutline className={styles.deleteLogo} onClick={() => DeleteOneCharge(charge._id)} />
                    <HiOutlineWrench className={styles.updateLogo} onClick={() => handleEditClick(charge)} />
                  </div>
                </td>

                <td>
                  {editableRow === charge._id ? (
                    <input className={styles.ChangeInput} type="text" defaultValue={charge.expenseName} onChange={(e) => handleChange(e, "expenseName")} />
                  ) : (
                    `✍️ ${charge.expenseName}`
                  )}
                </td>

                <td>
                  {editableRow === charge._id ? (
                    <select defaultValue={charge.expenseType} onChange={(e) => handleChange(e, "expenseType")}>
                      <option value={"Payroll"}>Payroll</option>
                      <option value={"Admin"}>Admin</option>
                      <option value={"Training"}>Training</option>
                      <option value={"Marketing"}>Marketing</option>
                      <option value={"Travel"}>Travel</option>
                      <option value={"HR"}>HR</option>
                      <option value={"Other"}>Other</option>
                    </select>
                  ) : (
                    charge.expenseType
                  )}
                </td>

                <td>
                  {editableRow === charge._id ? (
                    <input className={styles.ChangeInput} type="text" defaultValue={charge.amount} onChange={(e) => handleChange(e, "amount")} />
                  ) : (
                    `💷 ${charge.amount}`
                  )}
                </td>

                <td>
                  {editableRow === charge._id ? (
                    <select defaultValue={charge.status} onChange={(e) => handleChange(e, "status")}>
                      <option value="Fixed">Fixed</option>
                      <option value="Variable">Variable</option>
                    </select>
                  ) : (
                    charge.status
                  )}
                </td>

                <td>
                  {editableRow === charge._id ? (
                    <input className={styles.ChangeInput} type="number" defaultValue={charge.paymentDay} onChange={(e) => handleChange(e, "paymentDay")} />
                  ) : (
                    `📆 ${charge.paymentDay}`
                  )}
                </td>

                <td>⏱️ {formatDate(charge.createdAt)}</td>


                {editableRow === charge._id ? (
                  <td className={styles.editRow}>
                    <button onClick={handleSave} >✅</button>
                    <button onClick={() => setEditableRow(null)}>⛔</button>
                  </td>
                ) : null}

              </tr>
            ))}
          </tbody>
        </table>
      </div>


    </div>
  );
};

export default Charge;
