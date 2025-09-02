import * as React from 'react';
import { useState } from 'react';
import styles from './MonthlyActivities.module.scss';
import Generate from './Childs/Generate';
import Filter from './Childs/Filter';
import { FiLogOut } from "react-icons/fi";



const MonthlyActivities: React.FC = () => {
  // const token = localStorage.getItem("token");
  // const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [activeTab, setActiveTab] = useState<string>('partners')

  // useEffect(() => {
  //     if (token != null) {
  //       setIsAdmin(JSON.parse(atob(token.split(".")[1])).isAdmin);
  //       console.log(token)
  //       if (isAdmin === false) {
  //         window.location.href = "https://alightconsulting.sharepoint.com/sites/GeldPilot/SitePages/Login.aspx";
  //       }
  //     }
  //     if (token == null) {
  //       window.location.href = "https://alightconsulting.sharepoint.com/sites/GeldPilot/SitePages/Login.aspx";
  //     }
  //   }, [token, isAdmin]);


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
            Monthly Financial Activities
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
            Ganerate
          </p>
          <p
            className={`${styles.link} ${activeTab === 'create' ? styles.active : ''}`}
            onClick={() => setActiveTab('create')}>
            View Datas
          </p>
        </div>
      </div>
      <div className={styles.tableContainer}>
        {activeTab === 'partners' && <Generate />}
        {activeTab === 'create' && <Filter />}
      </div>
    </div>
  );
};
export default MonthlyActivities