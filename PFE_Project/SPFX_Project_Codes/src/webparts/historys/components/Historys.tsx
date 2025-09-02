import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from "./Historys.module.scss";
import InvoiceHistoryTab from './Childs/InvoiceHistoryTab';
import ChargeHistoryTab from './Childs/ChargeHistoryTab';
import { FiLogOut } from "react-icons/fi";


const Historys: React.FC = () => {
  const token = localStorage.getItem("token");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [activeTab, setActiveTab] = useState<string>('partners')

  useEffect(() => {
    if (token != null) {
      setIsAdmin(JSON.parse(atob(token.split(".")[1])).isAdmin);
      console.log(token)
      if (isAdmin === false) {
        window.location.href = "https://yml6b.sharepoint.com/sites/GeldPilot/SitePages/Login.aspx";
      }
    }
    if (token == null) {
      window.location.href = "https://yml6b.sharepoint.com/sites/GeldPilot/SitePages/Login.aspx";
    }
  }, [token, isAdmin]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "https://tenstepfrance.sharepoint.com/sites/GeldPilot/SitePages/Login.aspx";
  };

  return (
    <div className={styles.DashComp}>
      <div className={styles.logoutNav}>
        <button onClick={logout} className={styles.logoutBtn} title="Logout">
          <FiLogOut size={20} /> {/* Icône */}
        </button>      </div>
      <div className={styles.headerDash}>
        <div className={styles.titleDash}>
          <h5 className={styles.titleTextDash}>
            Financial Historys
          </h5>
          <img
            src={require('../assets/tenstep.png')}
            alt='logo'
            className={styles.logoImgDash}
          />
        </div>
        <div className={styles.navLinks}>
          <p
            className={`${styles.link} ${activeTab === 'partners' ? styles.active : ''}`}
            onClick={() => setActiveTab('partners')}>
            Invoices History
          </p>
          <p
            className={`${styles.link} ${activeTab === 'create' ? styles.active : ''}`}
            onClick={() => setActiveTab('create')}>
            Charges History
          </p>
        </div>
      </div>
      <div className={styles.tableContainer}>
        {activeTab === 'partners' && <InvoiceHistoryTab />}
        {activeTab === 'create' && <ChargeHistoryTab />}
      </div>
    </div>
  );
};
export default Historys