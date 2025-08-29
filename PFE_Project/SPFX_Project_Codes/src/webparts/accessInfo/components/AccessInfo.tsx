import * as React from 'react';
import { useEffect } from 'react';
import styles from '../components/AccessInfo.module.scss';
const AOS = require("aos");
import "aos/dist/aos.css";

const AccessInfo: React.FC = () => {
  useEffect(() => {
    AOS.init({ duration: 1500, once: true });
  }, []);


  return (
    <div className={styles.MainContent}>
      <div className={styles.container}>
        <div className={styles.textSection}>

          {/* <img src={require("../assets/10780255_19198219.jpg")} alt="Authorization Logo" className={styles.authLogo} /> */}
          <h1 className={styles.title}>
            Access to the Geld Pilot Platform
          </h1>
          <p className={styles.description}>
            Access to this platform and registration authorization are managed
            by the financial manager, <strong>Mrs Wahbi</strong>. To
            authenticate and create an account to track personalized financial
            management dashboards and statuses at Alight MEA, please contact her directly.
          </p>
        </div>

        <div className={styles.profileCard}>
          <img
            src={require("../assets/MED.jpg")}
            alt="Rayhane Tarchoun"
            className={styles.profileImage}
          />
          <h2 className={styles.profileName}>
            Rayhane Tarchoun
          </h2>
          <p className={styles.profilePosition}>Financial Manager</p>
          <p className={styles.profileEmail}>
            <a href="mailto:rayhan.tarchoun@alight.eu" className={styles.emailLink} style={{"color":"white","textDecoration":"none"}}>📧 rayhan.tarchoun@alight.eu</a>
          </p>
        </div>

      </div>
      <button className={styles.homebtn}
        onClick={()=>{window.location.href= "https://tenstepfrance.sharepoint.com/sites/GeldPilot/SitePages/Home.aspx"}}
      > 🏠 Go Home</button>
    </div>
  );
};

export default AccessInfo;
