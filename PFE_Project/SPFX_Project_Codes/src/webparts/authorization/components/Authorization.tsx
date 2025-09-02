import * as React from 'react';
import { useEffect, useState } from 'react';
import styles from './Authorization.module.scss';
import { IAuthorizationProps } from './IAuthorizationProps';
import emailjs from 'emailjs-com';
import axios from 'axios';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiLogOut } from "react-icons/fi";


const Authorization: React.FC<IAuthorizationProps> = () => {
  const token = localStorage.getItem("token");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>('partners');
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [users, setUsers] = useState<any[]>([]);
  const [authUsers, setAuthUsers] = useState<any[]>([]);

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

  useEffect(() => { fetchAllUsers(); }, []);
  useEffect(() => { fetchAllAuthorizedUsers(); }, []);

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3320/api/auth/get_all_users");
      setUsers(response.data.getAllUsers);
    } catch (error) {
      console.log("Error fetching users", error);
    }
  };

  const fetchAllAuthorizedUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3320/api/authorization/get_all");
      setAuthUsers(response.data.allAuthorizedUsers);
    } catch (error) {
      console.log("Error fetching authorized users", error);
    }
  };

  const createUserAuthorization = async () => {
    try {
      await axios.post("http://127.0.0.1:3320/api/authorization/create", { email: userEmail });
      setUserEmail("");
      handleSendEmail();
      fetchAllAuthorizedUsers();
      fetchAllUsers();
      notify("Authorization user created successfuly")
      setIsClicked(false)
    } catch (error) {
      setUserEmail("")
      notify("Error creating user authorization, try with another address.");

    }
  };

  const handleSendEmail = () => {
    const templateParams = {
      to_email: userEmail,
      subject: "Access Granted to Alight MEA Financial Management Platform",
      outlook: userEmail,
    };

    emailjs.send("service_nbwbgga", "template_407a0vi", templateParams, "sLtkVi6zMmrpgZFJV")
      .then(() => {
        notify(`Outlook authorization message successfully sent to user [${userEmail}]. ✅`);
      })
      .catch(() => {
        notify(`Outlook authorization message not sent to user [${userEmail}]. ⛔`);
      });
  };

  const deleteOneAuthUser = async (id: string, email: string) => {
    try {
      await axios.delete(`http://127.0.0.1:3320/api/authorization/delete_one/${id}`);
      fetchAllAuthorizedUsers();
      fetchAllUsers();
      notify(`User and authorization of [${email}] deleted successfully. 🗑️`);
    } catch (error) {
      notify(`User and authorization of [${email}] not deleted!`);
    }
  };

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

  const pad = (n: number) => (n < 10 ? '0' + n : n.toString());

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Les mois commencent à 0
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "https://tenstepfrance.sharepoint.com/sites/GeldPilot/SitePages/Login.aspx";
  };


  return (
    <div className={styles.authorizationComp}>
      <div className={styles.logoutNav}>
        <button onClick={logout} className={styles.logoutBtn} title="Logout">
          <FiLogOut size={20} /> {/* Icône */}
        </button>
      </div>
      <ToastContainer />
      <div className={styles.header}>
        <div className={styles.titleDash}>
          <h5 className={styles.titleTextDash}>
            Authorization Management
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

      <div >
        {activeTab === 'partners' && (
          <div>
            {users.length === 0 ? <p>No users registered in the database!</p> : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td style={{ textTransform: "capitalize", fontWeight: "500", textAlign: "center" }}>{user._id}</td>
                      <td style={{ textTransform: "capitalize", fontWeight: "500", textAlign: "start" }}>{user.name}</td>
                      <td style={{ textAlign: "start" }}><a href={`mailto:${user.email}`} style={{ textDecoration: "none", color: "inherit" }}>{user.email}</a></td>
                      <td style={{ textAlign: "end" }}><a href={`tel:${user.phone}`} style={{ textDecoration: "none", color: "inherit" }}>{user.phone}</a></td>
                      <td>{user.isConnected ? <div className={styles.connected}></div> : <div className={styles.notConnected}></div>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div  >
            <div className={styles.CreatedUser} >

              {isClicked ? <button className={styles.addUserBtnLogo} onClick={() => { setIsClicked(!isClicked); createUserAuthorization(); }}>➕</button> : <button className={styles.addUserBtnText} onClick={() => { setIsClicked(!isClicked) }}>Create New</button>}

              {/* <button className={isClicked ? styles.addUserBtnLogo : styles.addUserBtnText} onClick={() => { setIsClicked(!isClicked); createUserAuthorization(); }}>
                {isClicked ? "➕" : "Create New"}
              </button> */}

              {isClicked && (
                <input type="email" placeholder="Enter email of user" value={userEmail}

                  onChange={(e) => setUserEmail(e.target.value)} className={styles.userInput}
                  // ______Ecouter le click sur Entre_______________
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      createUserAuthorization();
                    }
                  }}
                />
              )}
            </div>
            {authUsers.length === 0 ? <p>No authorized users, you can create one.</p> : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Is Registered</th>
                    <th>Created At</th>
                    <th>Control</th>
                  </tr>
                </thead>
                <tbody>
                  {authUsers.map(user => (
                    <tr key={user._id}>
                      <td><a href={`mailto:${user.authorizedEmail}`} style={{ textDecoration: "none", color: "inherit" }}>{user.authorizedEmail}</a></td>
                      <td style={{ textAlign: "center" }}>{user.isRegistred ? "✅" : "⛔"}</td>
                      <td style={{ textAlign: "center" }}>{formatDate(user.createdAt)}</td>
                      <td style={{ textAlign: "center" }}><button className={styles.controlBtnDelete} onClick={() => deleteOneAuthUser(user._id, user.authorizedEmail)} >🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Authorization;
