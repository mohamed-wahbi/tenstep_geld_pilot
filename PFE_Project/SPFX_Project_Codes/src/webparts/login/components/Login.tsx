import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from '../components/Login.module.scss';
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
const AOS = require("aos");
import "aos/dist/aos.css";



interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  useEffect(() => {
    AOS.init({ duration: 1500, once: true });
  }, []);

  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Gestion du changement de ReCAPTCHA done
  const handleReCAPTCHAChange = (value: string | null) => {
    if (value) {
      setIsVerified(true);
      setErrorMessage("");
    }
  };

  // Gestion de l'expiration de ReCAPTCHA done
  const handleReCAPTCHAExpired = () => {
    setIsVerified(false);
    setErrorMessage("ReCAPTCHA expired. Please verify again.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isVerified) {
      setErrorMessage("Please complete the reCAPTCHA verification.");
      return;
    }
    setErrorMessage("");

    try {
      const response = await axios.post("http://127.0.0.1:3320/api/auth/login", {
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem("token", response.data.token);
      // je veux recuperer la token  et la decode puis  verifier si isAdmin=true or false si ces = true alor me deriger vers : window.location.href="https://yml6b.sharepoint.com/sites/GeldPilot/SitePages/Admin_Auth.aspx" si ces false me deriger au window.location.href="https://yml6b.sharepoint.com/sites/GeldPilot/SitePages/Partener_Dash.aspx"
      if (response.data.isAdmin == true) {
        window.location.href = "https://tenstepfrance.sharepoint.com/sites/GeldPilot/SitePages/Admin_Auth.aspx"
      }
      else {
        window.location.href = "https://yml6b.sharepoint.com/sites/GeldPilot/SitePages/Partener_Dash.aspx"
      }
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      setErrorMessage(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className={styles.authComp}>
      <div className={styles.backRight}>

        <div className={styles.miroir} onClick={() => { window.location.href = "https://yml6b.sharepoint.com/sites/GeldPilot/SitePages/Home.aspx" }}></div>

        <img src={require("../assets/Tablet login-amico.png")} alt="logo" width={80} className={styles.personLogo} />
      </div>

      <div className={styles.LoginContent}>
        <img src={require("../assets/tenstep.png")} alt="logo" style={{width:"200px", margin:"auto"}} />

        <div className={styles.welcomeTitre}>
          <h4>Welcome to Geld Pilot! 👋</h4>
        </div>
        <div className={styles.logoDescrip}>
          <p>Sign in to start your financial adventure.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.email}>
            <label>Email</label>
            <input
              name="email"
              placeholder="Enter your email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.email}>
            <label>Password</label>
            <input
              name="password"
              placeholder="Enter your password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <ReCAPTCHA
              sitekey="6Lc3j60rAAAAAD5re3r3PCYmUgjyjpbYfgltRbMG"
              onChange={handleReCAPTCHAChange}
              onExpired={handleReCAPTCHAExpired}  // Ajout de cette fonction pour détecter l'expiration
            />
          </div>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          <button className={styles.loginBtn} type="submit">Sign In</button>
        </form>

        <p style={{ textAlign: "center", fontSize: "15px" }}>
          New in our platform? <span style={{ color: "#62b0d3", fontWeight: "bold", cursor: "pointer" }}
            onClick={() => { window.location.href = "https://tenstepfrance.sharepoint.com/sites/GeldPilot/SitePages/Register.aspx" }}
          >Create an account</span>
        </p>

        <div className={styles.orStyle}>
          <p>OR</p>
          <hr />
        </div>

        <div className={styles.googleConnect}>
          <img src={require("../assets/google.jpg")} alt="google logo" />
        </div>
      </div>
    </div>
  );
};

export default Login;
