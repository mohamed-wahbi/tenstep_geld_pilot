import * as React from 'react';
import { useState , useEffect} from 'react';
import styles from "../components/Prediction.module.scss";

import PredictionForm from './Childs/PredictionForm';
import PredictionHistory from './Childs/PredictionHistory';

const NewClientCharge: React.FC = () => {
  const token = localStorage.getItem("token");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [activeTab, setActiveTab] = useState<string>('partners')

  useEffect(() => {
      if (token != null) {
        setIsAdmin(JSON.parse(atob(token.split(".")[1])).isAdmin);
        console.log(token)
        if (isAdmin === false) {
          window.location.href = "https://yml6b.sharepoint.com/sites/GeldPilot/SitePages/Partener_Dash.aspx";
        }
      }
      if (token == null) {
        window.location.href = "https://yml6b.sharepoint.com/sites/GeldPilot/SitePages/Login.aspx";
      }
    }, [token]);


    const logout = () => {
    localStorage.removeItem("token");
        window.location.href = "https://tenstepfrance.sharepoint.com/sites/GeldPilot/SitePages/Login.aspx";
  };

  return (
    <div className={styles.DashComp}>
      <div className={styles.logoutNav}>
        <button onClick={logout} className={styles.logoutBtn}>Logout</button>
      </div>
      <div className={styles.headerDash}>
        <div className={styles.titleDash}>
          <h5 className={styles.titleTextDash}>
            Predictions Management System
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
            Prediction
          </p>
          <p 
            className={`${styles.link} ${activeTab === 'create' ? styles.active : ''}`} 
            onClick={() => setActiveTab('create')}>
            History
          </p>
        </div>
      </div>
      <div className={styles.tableContainer}>
        {activeTab === 'partners' && <PredictionForm />}
        {activeTab === 'create' && <PredictionHistory />}
      </div>
    </div>
  );
};
export default NewClientCharge