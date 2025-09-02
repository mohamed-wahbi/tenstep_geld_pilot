import * as React from 'react';
import styles from './IaSupport.module.scss';
const AOS = require("aos");
import "aos/dist/aos.css";

import jsPDF from 'jspdf';
import { FaFilePdf, FaRobot, FaTrash } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FiLogOut } from "react-icons/fi";




const IaSupport: React.FC = () => {
  const token = localStorage.getItem("token");
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>("partners");
  const [userInput, setUserInput] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [chatHistory, setChatHistory] = React.useState<{ question: string; response: string }[]>([]);
  const [togelChatContent, setTogelChatContent] = React.useState<boolean>(false);
  const [selectedResponses, setSelectedResponses] = React.useState<number[]>([]);

  React.useEffect(() => {
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

  const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyDVipXK95cVqjfkSMav0PrJcMG1Yb2hQXo";
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => setUserInput(e.target.value);

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);

    try {
      const result = await model.generateContent(userInput);
      const response = result?.response?.text() || "No response received.";

      setChatHistory((prev) => [
        ...prev,
        { question: userInput, response: response.normalize("NFC") }
      ]);
      setUserInput("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setSelectedResponses([]);
  };


  const toggleSelectResponse = (index: number) => {
    setSelectedResponses((prev) => {
      const newSelection = prev.includes(index)
        ? prev.filter((i) => i !== index) // Supprime l'index s'il est déjà sélectionné
        : [...prev, index]; // Ajoute l'index s'il n'est pas encore sélectionné
      return [...newSelection]; // Renvoie un nouvel array pour garantir le bon déclenchement de React
    });
  };

  const deleteSelectedResponses = () => {
    setChatHistory((prev) => prev.filter((_, index) => !selectedResponses.includes(index)));

    // Utilisation de la fonction callback pour s'assurer qu'on met bien à jour `selectedResponses`
    setSelectedResponses(() => []);
  };



  const generatePDF = () => {
    if (selectedResponses.length === 0) return;

    const doc = new jsPDF();
    const date = new Date().toLocaleString("fr-FR");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#254989");
    doc.text("Technical Report", 10, 10);
    doc.setFontSize(12);
    doc.setTextColor("#27ae87");
    doc.text(`Date: ${date}`, 10, 20);

    let y = 30;
    selectedResponses.forEach((index) => {
      const { question, response } = chatHistory[index];

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor("#c78686");
      doc.text(`.${question}`, 10, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const responseText = doc.splitTextToSize(`_${response}`, 180);
      doc.text(responseText, 10, y);
      y += responseText.length * 7 + 10;

      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`Rapport_Technique_${Date.now()}.pdf`);
  };








  React.useEffect(() => {
    AOS.init({ duration: 1500, once: true });
  }, []);



  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "https://tenstepfrance.sharepoint.com/sites/GeldPilot/SitePages/Login.aspx";
  };

  return (
    <div className={styles.DashComp}>
      {/* Header Section */}
      <div className={styles.logoutNav}>
        <button onClick={logout} className={styles.logoutBtn} title="Logout">
          <FiLogOut size={20} /> {/* Icône */}
        </button>      </div>
      <div className={styles.header}>
        <div className={styles.titleDash}>
          <h5 className={styles.titleTextDash}>
            AI Support Tools
          </h5>
          <img
            src={require('../assets/tenstep.png')}
            alt='logo'
            className={styles.logoImgDash}
          />
        </div>
        <div className={styles.navLinks}>
          <p className={`${styles.link} ${activeTab === 'partners' ? styles.active : ''}`} onClick={() => setActiveTab('partners')}>Partners</p>
          <p className={`${styles.link} ${activeTab === 'create' ? styles.active : ''}`} onClick={() => setActiveTab('create')}>Create User</p>
        </div>
      </div>

      <div className={styles.DashContent}>
        {activeTab === "partners" && (
          <div className={styles.TechChatboot}>
            <div className={styles.chatTechHeader}>
              <h3>Hello sir 👋</h3>
              <p>Need A Technical Refresh And A Quick PDF Report? Ask Your Questions To Me 🤔⁉️</p>
              {!togelChatContent && (
                <button
                  className={`${styles.getStartBtn} ${styles.animated}`}
                  onClick={() => setTogelChatContent(!togelChatContent)}
                >
                  ⬇️
                </button>
              )}
            </div>
            {togelChatContent && (
              <div className={styles.chatbotContainer}>
                <h1 className={styles.title}>
                  <FaRobot className={`${styles.robotIcon} ${styles.animated}`} /> SMARTY Assistant
                </h1>

                <div className={`${styles.chatBox} ${styles.animatedBox}`}>
                  {chatHistory.length > 0 && (
                    <button className={styles.clearBtn} onClick={clearChat}>
                      <IoCloseSharp />
                    </button>
                  )}
                  {chatHistory.map(({ question, response }, index) => (
                    <div key={index} >
                      <div className={`${styles.message} ${styles.user}`}>👤 {question}</div>
                      <div className={`${styles.message} ${styles.bot}`}>
                        <input
                          type="checkbox"
                          checked={selectedResponses.indexOf(index) !== -1}
                          style={{ marginRight: "5px" }}
                          onChange={() => toggleSelectResponse(index)}
                        />
                        🤖 {response}
                      </div>
                    </div>
                  ))}
                  {isLoading && <div className={styles.loading}>⏳ Génération en cours...</div>}
                </div>

                <div className={styles.inputArea}>
                  <input
                    type="text"
                    placeholder="Écrivez votre message..."
                    value={userInput}
                    onChange={handleUserInput}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendMessage()
                      }
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !userInput.trim()}
                    title="Envoyer le message"
                  >
                    <IoIosSend />
                  </button>
                </div>
                <div className={styles.actions}>
                  {selectedResponses.length > 0 && (
                    <>
                      <button className={styles.pdfBtn} onClick={generatePDF}>
                        <FaFilePdf />{" "} PDF
                      </button>
                      <button className={styles.deleteOneBtn} onClick={deleteSelectedResponses}>
                        <FaTrash />
                      </button>
                    </>
                  )}


                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "create" && <div>ChatBot Microsoft virtual agent here ! To do....</div>}
      </div>
    </div>
  );
};

export default IaSupport;
