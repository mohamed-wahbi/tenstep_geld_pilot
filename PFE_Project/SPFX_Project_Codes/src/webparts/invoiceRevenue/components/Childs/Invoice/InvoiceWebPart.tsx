import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from '../../InvoiceRevenue.module.scss';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const { VocaFlexMWSTn } = require('vecoflextnmws')
import { MdDeleteOutline } from "react-icons/md";
import { HiOutlineWrench } from "react-icons/hi2";
import CurrencyExchange from './currencyExchange';

interface Invoice {
  _id: string;
  id_client: {_id: string, name: string, currency: string; } | null;
  montantInitial: number;
  remise: number;
  montantApresRemise: number;
  montantPaye: number;
  montantRestant: number;
  datePaiementEntreprise: string;
  datePaiementClient: string;
  commentairePaiement: string,
  statut: string;
}

interface Client {
  _id: string;
  name: string;
  currency: string;
}

const InvoiceWebPart: React.FC = () => {
  const [currencyTab,setCurrencyTab] = useState (false)
  const [addInvoicective, setAddInvoicective] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [editedMontantPaye, setEditedMontantPaye] = useState<{ [key: string]: number }>({});

  const [newInvoice, setNewInvoice] = useState({
    id_client: '',
    montantInitial: 0,
    remise: 0,
    montantPaye: 0,
    datePaiementEntreprise: '',
    statut: 'unpaid',
  });

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3320/api/invoice/getAll');
      setInvoices(res.data.invoices || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des invoices :', error);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3320/api/client/getAll');
      setClients(res.data.clients || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients :', error);
    }
  }, []);

  // -----------------------Filter System--------------------------------
  const [allFiltredDatas, setAllFiltredDatas] = useState<Invoice[]>([])
  const [oneFiltredData, setOneFiltredData] = useState<Invoice | null>(null)

  console.log(allFiltredDatas);// liste des données filtre

  console.log(oneFiltredData)// un ligne de la liste des données filtré


  const getAllFiltredDatas = (data: Invoice[]) => { setAllFiltredDatas(data) }
  const getOneFiltredData = (data: Invoice) => { setOneFiltredData(data) }
  // ___________________________________________________________________


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewInvoice((prev) => ({
      ...prev,
      [name]: ['montantInitial', 'remise', 'montantPaye'].includes(name) ? parseFloat(value) || 0 : value,
    }));
  };



  const handleAddInvoice = async () => {
    if (!newInvoice.id_client) {
      notify('Select one client!🕴️')
      return;
    }
    try {
      await axios.post('http://127.0.0.1:3320/api/invoice/create', newInvoice);
      fetchInvoices();
      setNewInvoice({
        id_client: '',
        montantInitial: 0,
        remise: 0,
        montantPaye: 0,
        datePaiementEntreprise: '',
        statut: 'unpaid',
      });
      setAddInvoicective(false);
      notify("Invoice created successfully. ✅")
    } catch (error) {
      console.error("Erreur lors de l'ajout de la facture :", error);
      notify("Invoice not created! ⛔")

    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://127.0.0.1:3320/api/invoice/deleteOne/${id}`);
      fetchInvoices();
      notify("Invoice deleted successfully. ✅")
    } catch (error) {
      notify("Invoice not deleted! ⛔")
      console.error('Erreur lors de la suppression de la facture :', error);
    }
  };

  const handleEditClick = (invoice: Invoice) => {
    setEditingInvoiceId(invoice._id);
    setEditedMontantPaye({
      ...editedMontantPaye,
      [invoice._id]: invoice.montantPaye,
    });
  };

  const handleMontantChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    setEditedMontantPaye({
      ...editedMontantPaye,
      [id]: parseFloat(e.target.value) || 0,
    });
  };

  const handleUpdate = async (id: string) => {
    const updatedMontantPaye = editedMontantPaye[id];
    try {
      const updatedInvoice = invoices.find((inv) => inv._id === id);
      if (!updatedInvoice) return;
      const updatedData: Partial<Invoice> = { montantPaye: updatedMontantPaye };
      if (updatedMontantPaye >= updatedInvoice.montantApresRemise) {
        updatedData.datePaiementClient = new Date().toISOString();
        updatedData.statut = "discharged";
      }
      await axios.put(`http://127.0.0.1:3320/api/invoice/updateOne/${id}`, updatedData);
      fetchInvoices();
      setEditingInvoiceId(null);
      notify("Invoise Updated successfuly. ✅")
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la facture :", error);
      notify("Invoise not Updated! ⛔")

    }
  };

  const handleCancelEdit = () => {
    setEditingInvoiceId(null);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Not Paid";
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
  };


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


  // ---------------------------Reload Btn----------------------------------
  const reloadClientsDatas = () => {
    fetchInvoices()
    notify("All Invoices are reloaded from the Data Base. ✅")
  }
  // _______________________________________________________________________


  return (

    <div className={styles.tableContainer}>
      <ToastContainer />

      <div className={styles.HeaderTabelCtrl}>
        <div className={styles.searchInput}>
          <VocaFlexMWSTn
            data={invoices}
            keys={["statut", "clientName"]}
            lang={"en-US"}
            threshold={"0.4"}
            allFiltredDatas={getAllFiltredDatas}
            oneFiltredData={getOneFiltredData}
            titre={"clientName"}
            description={"statut"}
          />

        </div>

        <div className={styles.ctrlTabBtns}>
          <button onClick={()=>setCurrencyTab(!currencyTab)}>💱</button>
          <button onClick={() => setAddInvoicective(!addInvoicective)}>🆕</button>
          <button onClick={reloadClientsDatas}>🔄️</button>
          
        </div>
      </div>
      {currencyTab? <CurrencyExchange/> : null}

      <div className={styles.TableContent}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Controls</th>
              <th>Client</th>
              <th>Used Currencies</th>
              <th>Initial Amount</th>
              <th>Discount (%)</th>
              <th>Amount After Discount</th>
              <th>Paid Amount</th>
              <th>Remaining Amount</th>
              <th>Company Payment Date</th>
              <th>Client Last Payment Date</th>
              <th>Payment Comment</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {/* pour lajout de nouveau invoice: */}
            {addInvoicective ?
              <tr>
                <td>➕</td>
                <td><select name="id_client" onChange={handleChange} value={newInvoice.id_client} className={styles.CreateInput}>
                  <option value="">Sélectionner un client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                </td>
                <td>Auto Generated</td>
                <td><input className={styles.CreateInput} type="number" name="montantInitial" placeholder="Montant Initial (€)" onChange={handleChange} value={newInvoice.montantInitial} />
                </td>
                <td>
                  <input className={styles.CreateInput} type="number" name="remise" placeholder="Remise (%)" onChange={handleChange} value={newInvoice.remise} />
                </td>
                <td>Auto Generated</td>
                <td>
                  <input className={styles.CreateInput} type="number" name="montantPaye" placeholder="Montant Payé (€)" onChange={handleChange} value={newInvoice.montantPaye} />
                </td>
                <td>Auto Generated</td>
                <td>
                  <input className={styles.CreateInput} type="date" name="datePaiementEntreprise" onChange={handleChange} value={newInvoice.datePaiementEntreprise} />
                </td>
                <td>Auto Generated</td>
                <td>Auto Generated</td>
                <td>Auto Generated</td>
                <td className={styles.CreateRowStyle}>
                  <button style={{ border: "none", cursor: "pointer", background: "transparent" }} onClick={handleAddInvoice}>💾</button>
                  <button style={{ border: "none", cursor: "pointer", background: "transparent" }} onClick={() => setAddInvoicective(false)}>❌</button>
                </td>
              </tr>
              : null
            }

            {(allFiltredDatas.length != 0 ? allFiltredDatas : invoices).map((invoice) => (
              <tr key={invoice._id}>
                {invoice.statut === "discharged" ?<td className={styles.ctrlCl}><p>✅</p></td> :
                  <td className={styles.ctrlCl}>
                    <span>⚙️</span>
                    <div className={styles.ctrlBtn}>
                      <MdDeleteOutline className={styles.deleteLogo} onClick={() => handleDelete(invoice._id)} />
                      <HiOutlineWrench className={styles.updateLogo} onClick={() => handleEditClick(invoice)} />
                    </div>
                  </td>
                } 

                <td>{invoice.id_client?.name || "Inconnu"}</td>
                <td>{invoice.id_client?.currency || "Inconnu"}</td>
                
                <td>{invoice.montantInitial.toFixed(2)} DNT</td>
                <td>{invoice.remise} %</td>
                <td>{invoice.montantApresRemise?.toFixed(2)} DNT</td>
                <td>
                  {editingInvoiceId === invoice._id ? (
                    <input
                      className={styles.ChangeInput}
                      type="number"
                      value={editedMontantPaye[invoice._id] || 0}
                      onChange={(e) => handleMontantChange(e, invoice._id)}
                    />
                  ) : (
                    `${invoice.montantPaye?.toFixed(2)} DNT`
                  )}
                </td>
                <td>{invoice.montantRestant?.toFixed(2)} DNT</td>
                <td>{formatDateTime(invoice.datePaiementEntreprise)}</td>
                <td>{formatDateTime(invoice.datePaiementClient)}</td>
                <td>{invoice.commentairePaiement ? invoice.commentairePaiement : "No Payment Yet"}</td>
                <td>{invoice.statut}</td>

                {editingInvoiceId === invoice._id ? (
                  <td className={styles.editRow}>
                    <button onClick={() => handleUpdate(invoice._id)} >✅</button>
                    <button onClick={handleCancelEdit}>⛔</button>
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

export default InvoiceWebPart;
