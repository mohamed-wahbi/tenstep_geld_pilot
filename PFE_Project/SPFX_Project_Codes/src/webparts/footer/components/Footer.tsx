import * as React from 'react';
import styles from './Footer.module.scss';
import { FaLinkedin, FaXing, FaYoutube, FaFacebook, FaTwitter, FaHeart, FaCopyright } from 'react-icons/fa';
const AOS = require("aos");
import "aos/dist/aos.css";

const Footer: React.FC = () => {
  React.useEffect(() => {
    AOS.init({ duration: 1500, once: true });
  }, []);

  return (
    <div className={styles.footerComp}>
      <div className={styles.footerTop}>
        <div className={styles.alightLogo}>
          <img src={require('../assets/tenstep.png')} alt='Alight Logo' />
        </div>
        <div className={styles.alightSocials}>
          <div className={styles.socialIcon}><a href="https://www.linkedin.com/company/alight-consulting-gmbh/" target="_blank"><FaLinkedin /></a></div>
          <div className={styles.socialIcon}><a href="https://www.xing.com/pages/alightconsultinggmbh" target="_blank"><FaXing /></a></div>
          <div className={styles.socialIcon}><a href="https://www.youtube.com/@alightconsultinggmbh" target="_blank"><FaYoutube /></a>  </div>
          <div className={styles.socialIcon}><a href="https://www.facebook.com/AlightConsultingGmbH" target="_blank"><FaFacebook /></a></div>
          <div className={styles.socialIcon}><a href="https://x.com/i/flow/login?redirect_after_login=%2FAlightCon" target="_blank"><FaTwitter /></a></div>
          {/* links not suported by edge */}
        </div>
        <div className={styles.alightLinks}>
          <a className={styles.linkText} href="https://www.tenstep.tn/" target='_blank'>Home</a>
          <div className={styles.bar}></div>
          <a className={styles.linkText} href="https://www.tenstep.tn/" target='_blank'>Solutions</a>
          <div className={styles.bar}></div>
          <a className={styles.linkText} href="https://www.tenstep.tn/" target='_blank'>Technologies</a>
          <div className={styles.bar}></div>
          <a className={styles.linkText} href="https://www.tenstep.tn/" target='_blank'>References</a>
          <div className={styles.bar}></div>
          <a className={styles.linkText} href="https://www.tenstep.tn/" target='_blank'>About Us</a>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <h5>GELD PILOT platform, created with love <FaHeart className={styles.heartIcon} /> by Salwej Med. Wahbi</h5>
        <p><FaCopyright /> All rights reserved</p>
      </div>
    </div>
  );
};

export default Footer;
