import * as React from "react";
import styles from "./Welcome.module.scss";
const AOS = require("aos");
import "aos/dist/aos.css"; // Import du style AOS

const Welcome: React.FC = () => {
  React.useEffect(() => {
    AOS.init({ duration: 2000, once: true }); // Initialise AOS avec une durée de 2s
  }, []);

  return (
    <div className={styles.container} >
      <div className={styles.backgroundImage}>
        <div className={styles.contentLeft} data-aos="fade-up" data-aos-duration="1500">
          <div className={styles.contentLeft1}>
            <img
              src={require("../assets/tenstep.png")}
              alt="Welcome"
              className={styles.logoImg}
              data-aos="zoom-in"
              data-aos-duration="2000"
            
            />
            <h1 className={styles.title} data-aos="fade-down">
               Welcome To The<span style={{color:"#c2272d"}}> TENSTEP </span>Platform
            </h1>
            <p className={styles.paragraph} data-aos="fade-up">
                Thanks to its advanced features, it ensures <span style={{color:"#e4bc9c"}}>precise tracking</span> of <span style={{color:"#89a4c1"}}>transactions</span>, <span style={{color:"#e4bc9c"}}>better budget </span> <span style={{color:"#89a4c1"}}>planning</span>, and <span style={{color:"#e4bc9c"}}>in-depth real-time </span><span style={{color:"#89a4c1"}}>financial analysis</span>             </p>
            <button className={styles.getStartedButton} data-aos="flip-left"
                onClick={() => window.location.href = "https://tenstepfrance.sharepoint.com/sites/GeldPilot/SitePages/Login.aspx"}
            >
              Get Started
            </button>
          </div>
           
          <div className={styles.contentRight} data-aos="fade-left" data-aos-duration="1500">
            <img
              src={require("../assets/money.png")}
              alt="logo"
              className={styles.moneyLogo}
              data-aos="rotate"
              data-aos-duration="2500"
            />
            <p className={styles.moneyP} data-aos="fade-up">Lets Make Money</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
