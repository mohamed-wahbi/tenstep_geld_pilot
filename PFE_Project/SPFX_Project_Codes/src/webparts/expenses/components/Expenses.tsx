import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from '../components/Expenses.module.scss';
import MonthlyCharge from './Childs/MonthlyCharge';
import Charge from './Childs/Charge';
import Results from './Childs/Results';

const NewClientCharge: React.FC = () => {
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


  return (
    <div className={styles.DashComp}>
      <div className={styles.headerDash}>
        <div className={styles.titleDash}>
          <h5 className={styles.titleTextDash}>
            Expenses Management System
          </h5>
          <img 
            src={require('../assets/logo-removebg-preview.png')} 
            alt='logo' 
            className={styles.logoImgDash} 
          />
        </div>
        <div className={styles.navLinks}>
          <p 
            className={`${styles.link} ${activeTab === 'partners' ? styles.active : ''}`} 
            onClick={() => setActiveTab('partners')}>
            Expenses
          </p>
          <p 
            className={`${styles.link} ${activeTab === 'create' ? styles.active : ''}`} 
            onClick={() => setActiveTab('create')}>
            Monthly Expenses
          </p>

          <p 
            className={`${styles.link} ${activeTab === 'result' ? styles.active : ''}`} 
            onClick={() => setActiveTab('result')}>
            Monthly Expenses Results
          </p>
        </div>
      </div>
      <div className={styles.tableContainer}>
        {activeTab === 'partners' && <Charge />}
        {activeTab === 'create' && <MonthlyCharge />}
        {activeTab === 'result' && <Results />}
      </div>
    </div>
  );
};
export default NewClientCharge