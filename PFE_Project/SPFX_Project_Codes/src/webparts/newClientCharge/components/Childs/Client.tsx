import * as React from 'react';
import { useEffect, useState } from 'react';
const AOS = require("aos");
import "aos/dist/aos.css";
import styles from "../../components/NewClientCharge.module.scss";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { MdDeleteOutline } from "react-icons/md";
import { HiOutlineWrench } from "react-icons/hi2";
const { VocaFlexMWSTn } = require('vecoflextnmws')




interface Client {
  _id: string;
  cin: string
  name: string;
  email: string;
  phone: string;
  address: string;
  clientType: string;
  paymentMethod: string;
  currency: string;
  createdAt: string;
  status: string;
}




const ClientComp: React.FC = () => {

  const [clients, setClients] = useState<Client[]>([]); // ✅ Ajout du type Client[]
  const [editableRow, setEditableRow] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Client>>({});
  const [originalData, setOriginalData] = useState<Partial<Client>>({});

  useEffect(() => {
    fetchClients();
  }, []);


  // -----------------------------Get All Clients--------------------------------------------
  const fetchClients = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3320/api/client/getAll");
      setClients(response.data.clients); // ✅ Forçage du type si nécessaire
    } catch (error) {
      console.error("Erreur in fetching of clients :", error);
    }
  };
  // _________________________________________________________________________________________





  // -----------------------------Delete One Client--------------------------------------------
  const DeleteOneClient = async (id: string) => {
    try {
      await axios.delete(`http://127.0.0.1:3320/api/client/deleteOne/${id}`);
      fetchClients()
      notify('Client deleted successfully . ✅')
    } catch (error) {
      console.error("Erreur in delete of client !", error);
    }
  };
  // _________________________________________________________________________________________





  // -----------------------------Update One Client--------------------------------------------
  // Mettre à jour un client
  const updateClient = async (id: string, updatedData: Partial<Client>) => {
    if (Object.keys(updatedData).length === 0) {
      setEditableRow(null)
      notify("No changes detected ! 🤔");
      return;
    }
    try {
      await axios.put(`http://127.0.0.1:3320/api/client/updateOne/${id}`, updatedData);
      notify("Client updated successfully ! ✅");
      fetchClients();
      setEditableRow(null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du client :", error);
      notify("Erreur lors de la mise à jour du client !");
    }
  };

  const handleEditClick = (client: Client) => {
    setEditableRow(client._id);
    setOriginalData(client);
    setEditedData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Client) => {
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
      updateClient(editableRow, editedData);
    }
  };
  // _________________________________________________________________________________________







  // -----------------------Filter System--------------------------------
  const [allFiltredDatas, setAllFiltredDatas] = useState<Client[]>([])
  const [oneFiltredData, setOneFiltredData] = useState<Client | null>(null)

  console.log(allFiltredDatas);// liste des données filtre

  console.log(oneFiltredData)// un ligne de la liste des données filtré


  const getAllFiltredDatas = (data: Client[]) => { setAllFiltredDatas(data) }
  const getOneFiltredData = (data: Client) => { setOneFiltredData(data) }
  // ___________________________________________________________________





  // ------------------------------Create Client------------------------------------------------
  const [newClientData, setNewClientData] = useState<Partial<Client> | null>(null);

  // Création d'un nouveau client (affichage d'une ligne vide)
  const createNewClient = () => {
    setNewClientData({
      cin: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      clientType: "Individual",
      paymentMethod: "Credit Card",
      currency: "Dollar",
      status: "Active"
    });
  };

  // Mise à jour des données du nouveau client
  const handleNewClientChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof Client
  ) => {
    setNewClientData((prev) =>
      prev ? { ...prev, [field]: e.target.value } : null
    );
  };

  // Sauvegarde du nouveau client
  const saveNewClient = async () => {
    if (!newClientData || !newClientData.name || !newClientData.cin || !newClientData.email) {
      notify("Veuillez remplir tous les champs obligatoires ! ⛔");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:3320/api/client/create", newClientData);
      notify("Client Created successfully. ✅");
      fetchClients();
      setNewClientData(null);
    } catch (error) {
      console.error("Erreur lors de la création du client :", error);
      notify("Erreur of creation client! ⛔");
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
  const reloadClientsDatas = () => {
    fetchClients()
    notify("All clients reloaded from the Data Base. ✅")
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
            data={clients}
            keys={["name", "clientType"]}
            lang={"en-US"}
            threshold={"0.4"}
            allFiltredDatas={getAllFiltredDatas}
            oneFiltredData={getOneFiltredData}
            titre={"name"}
            description={"description"}
          />

        </div>

        <div className={styles.ctrlTabBtns}>
          <button onClick={createNewClient}>🆕</button>
          <button onClick={reloadClientsDatas}>🔄️</button>
        </div>
      </div>

      <div className={styles.TableContent}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Controls</th>
              <th>ID</th>
              <th>CIN</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Client Type</th>
              <th>Payment Method</th>
              <th>Used Currencies</th>
              <th>Registration Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>

            {/* Ligne pour ajouter un nouveau client en haut du tableau */}
            {newClientData && (
              <tr>
                <td style={{ textAlign: "center" }}>➕</td>
                <td>
                  auto generated
                </td>
                <td>
                  <input className={styles.CreateInput} type="text" value={newClientData.cin} onChange={(e) => handleNewClientChange(e, "cin")} />
                </td>
                <td>
                  <input className={styles.CreateInput} type="text" value={newClientData.name} onChange={(e) => handleNewClientChange(e, "name")} />
                </td>
                <td>
                  <input className={styles.CreateInput} type="email" value={newClientData.email} onChange={(e) => handleNewClientChange(e, "email")} />
                </td>
                <td>
                  <input className={styles.CreateInput} type="text" value={newClientData.phone} onChange={(e) => handleNewClientChange(e, "phone")} />
                </td>
                <td>
                  <input className={styles.CreateInput} type="text" value={newClientData.address} onChange={(e) => handleNewClientChange(e, "address")} />
                </td>
                <td>
                  <select value={newClientData.clientType} onChange={(e) => handleNewClientChange(e, "clientType")}>
                    <option>Company</option>
                    <option>Individual</option>
                  </select>
                </td>
                <td>
                  <select value={newClientData.paymentMethod} onChange={(e) => handleNewClientChange(e, "paymentMethod")}>
                    <option>Bank Transfer</option>
                    <option>Credit Card</option>
                    <option>Cash</option>
                  </select>
                </td>
                <td>
                  <select value={newClientData.currency} onChange={(e) => handleNewClientChange(e, "currency")}>
                    <option>Dinar</option>
                    <option>Dollar</option>
                    <option>Euro</option>
                  </select>
                </td>

                <td>
                  auto generated
                </td>
                <td>
                  <select value={newClientData.status} onChange={(e) => handleNewClientChange(e, "status")}>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Blocked</option>
                  </select>
                </td>

                <td className={styles.CreateRowStyle}>
                  <button style={{ border: "none", cursor: "pointer", background: "transparent" }} onClick={saveNewClient} >💾</button>
                  <button style={{ border: "none", cursor: "pointer", background: "transparent" }} onClick={() => setNewClientData(null)}>❌</button>
                </td>
              </tr>
            )}






            {(allFiltredDatas.length != 0 ? allFiltredDatas : clients).map((client) => (
              <tr key={client._id}>
                <td className={styles.ctrlCl} style={{ textAlign: "center" }}>
                  <span>⚙️</span>
                  <div className={styles.ctrlBtn}>
                    <MdDeleteOutline className={styles.deleteLogo} onClick={() => DeleteOneClient(client._id)} />
                    <HiOutlineWrench className={styles.updateLogo} onClick={() => handleEditClick(client)} />
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>{client._id}</td>
                <td style={{ textAlign: "center" }}>{client.cin}</td>
                <td>
                  {editableRow === client._id ? (
                    <input className={styles.ChangeInput} type="text" defaultValue={client.name} onChange={(e) => handleChange(e, "name")} />
                  ) : (
                    `${client.name}`
                  )}
                </td>


                <td>
                  {editableRow === client._id ? (
                    <input className={styles.ChangeInput} type="email" defaultValue={client.email} onChange={(e) => handleChange(e, "email")} />
                  ) : (
                    `${client.email}`
                  )}
                </td>
                <td style={{ textAlign: "end" }}>
                  {editableRow === client._id ? (
                    <input className={styles.ChangeInput} type="text" defaultValue={client.phone} onChange={(e) => handleChange(e, "phone")} />
                  ) : (
                    `${client.phone}`
                  )}
                </td>
                <td>
                  {editableRow === client._id ? (
                    <input className={styles.ChangeInput} type="text" defaultValue={client.address} onChange={(e) => handleChange(e, "address")} />
                  ) : (
                    `${client.address}`
                  )}
                </td>
                <td>
                  {editableRow === client._id ? (
                    <select defaultValue={client.clientType} onChange={(e) => handleChange(e, "clientType")}>
                      <option value="Company">Company</option>
                      <option value="Individual">Individual</option>
                    </select>
                  ) : (
                    client.clientType
                  )}
                </td>
                <td>
                  {editableRow === client._id ? (
                    <select defaultValue={client.paymentMethod} onChange={(e) => handleChange(e, "paymentMethod")}>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                    </select>
                  ) : (
                    client.paymentMethod
                  )}
                </td>
                <td>
                  {editableRow === client._id ? (
                    <select defaultValue={client.currency} onChange={(e) => handleChange(e, "currency")}>
                      <option value="Dinar">Dinar</option>
                      <option value="Dollar">Dollar</option>
                      <option value="Euro">Euro</option>
                    </select>
                  ) : (
                    client.currency
                  )}
                </td>
                <td style={{ textAlign: "center" }}>{formatDate(client.createdAt)}</td>
                <td style={{ textAlign: "center" }}>
                  {editableRow === client._id ? (
                    <select defaultValue={client.status} onChange={(e) => handleChange(e, "status")}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  ) : (
                    client.status
                  )}
                </td>

                {editableRow === client._id ? (
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

export default ClientComp;
