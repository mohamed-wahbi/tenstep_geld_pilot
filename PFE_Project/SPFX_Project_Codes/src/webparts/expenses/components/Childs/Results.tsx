import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from '../../components/Expenses.module.scss';
import { ToastContainer, toast, Bounce } from 'react-toastify';
const AOS = require("aos");
import "aos/dist/aos.css";
import axios from 'axios';
const { VocaFlexMWSTn } = require('vecoflextnmws')





interface ChargeResult {
    _id: string,
    month: string,
    year: string,
    isConfirmed: boolean,
    expenseType: string,
    totalAmount: string,
    totalCharges: string,
    createdAt: string,
}

const results: React.FC = () => {
    const [chargeResults, setChargeResults] = useState<ChargeResult[]>([]);
    const [generatChargeResultTab, setGeneratChargeResultTab] = useState(false);
    const [year, setYear] = useState("")
    const [month, setMonth] = useState("")

    // Featching Data 
    useEffect(() => {
        FeatchingChargeResults()
    }, [])

    // -----------------------Filter System--------------------------------
    const [allFiltredDatas, setAllFiltredDatas] = useState<ChargeResult[]>([])
    const [oneFiltredData, setOneFiltredData] = useState<ChargeResult | null>(null)

    console.log(allFiltredDatas);// liste des données filtre

    console.log(oneFiltredData)// un ligne de la liste des données filtré


    const getAllFiltredDatas = (data: ChargeResult[]) => { setAllFiltredDatas(data) }
    const getOneFiltredData = (data: ChargeResult) => { setOneFiltredData(data) }
    // ___________________________________________________________________



    // -------------------------Featching Revenue--------------------------------
    const FeatchingChargeResults = async () => {
        try {
            const ChargeResultData = await axios.get("http://127.0.0.1:3320/api/monthly-expense-result/getAll")
            setChargeResults(ChargeResultData.data.MonthlyExpenseResultDatas)
        } catch (error) {
            console.log("Error Featching Monthly Expense Result Datas from DB !")
        }
    }
    // ___________________________________________________________________________



    // ------------------------------generatedRevenue Function---------------------------------
    const generatedChargeResult = async (year: string, month: string) => {
        try {
            setYear(year);
            setMonth(month);
            await axios.post(`http://127.0.0.1:3320/api/monthly-expense-result/generate/${year}/${month}`)
            notify("Monthly Expense Result Generated successfuly. ✅")
            FeatchingChargeResults()
            setYear("");
            setMonth("");
            setGeneratChargeResultTab(false)
        } catch (error) {
            setYear("");
            setMonth("");
            notify("Please choose an existing year and month ⛔")
            notify("year and month format: YYYY-MM 😉")

        }
    }

    // ___________________________________________________________________________________________




    // ------------------------------generatedRevenue Function---------------------------------
    const confirmeMonthChargeResult = async () => {
        try {

            await axios.post(`http://127.0.0.1:3320/api/monthly-expense-result/confirmAll`)
            setChargeResults([])
            FeatchingChargeResults()
            notify("Charge Result of this monthe are Confirmed successfuly. ✅")


        } catch (error) {

            notify("Please try agan ! ⛔")


        }
    }

    // ___________________________________________________________________________________________


    // ----------------------------------Notif Alert---------------------------------
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
    // _______________________________________________________________________________





    React.useEffect(() => {
        AOS.init({ duration: 1500, once: true });
    }, []);

    return (
        <div className={styles.tableContainer}>
            <ToastContainer />

            <div className={styles.HeaderTabelCtrl} style={{ display: "flex", justifyContent: "end", alignItems: "center" }}>

                <div className={styles.searchInput}>
                    <VocaFlexMWSTn
                        data={chargeResults}
                        keys={["year", "month", "expenseType"]}
                        lang={"en-US"}
                        threshold={"0.4"}
                        allFiltredDatas={getAllFiltredDatas}
                        oneFiltredData={getOneFiltredData}
                        titre={"expenseType"}
                        description={"totalAmount"}
                    />
                </div>

                <div className={styles.generateRevenue}>
                    <div className={styles.Top}>
                        <p>Generat Revenue</p>
                        <button onClick={() => {
                            setGeneratChargeResultTab(!generatChargeResultTab);
                            setYear("");
                            setMonth("")
                        }} >{generatChargeResultTab ? "❌" : "🆕"} </button>
                    </div>

                    {
                        generatChargeResultTab ?
                            <div className={styles.GenerateForm} >
                                <div className={styles.inputGenerateForm}>
                                    <label>Year</label>
                                    <input style={{ marginLeft: "15px" }} placeholder='2025' value={year} onChange={(e) => setYear(e.target.value)} required />
                                </div>

                                <div className={styles.inputGenerateForm}>
                                    <label>Month</label>
                                    <input placeholder='01 - 12' value={month} onChange={(e) => setMonth(e.target.value)} required />
                                </div>
                                <div className={styles.btnContent}>
                                    <button style={{ border: "none" }} onClick={() => generatedChargeResult(year, month)}>➕</button>
                                </div>
                            </div>
                            : null
                    }
                </div>

            </div>

           
            {chargeResults.length > 0 ? <div>
                <button onClick={confirmeMonthChargeResult} className={styles.confirmeRevenuesBtn}>✅ Confirme All Expenses</button>
            </div> : null}



            <div className={styles.TableContent} >
                <table className={styles.table}>
                    <thead>
                        <th>Year</th>
                        <th>Month</th>
                        <th>Expense Type</th>
                        <th>Charge Number</th>
                        <th>Total Amount</th>
                    </thead>
                    <tbody>
                        {
                            (allFiltredDatas.length > 0 ? allFiltredDatas : chargeResults).map((chargeResult) => {
                                return (
                                    <tr key={chargeResult._id}>
                                        <td style={{textAlign:"center"}}>{chargeResult.year} </td>
                                        <td style={{textAlign:"center"}}>{chargeResult.month} </td>
                                        <td style={{ fontWeight: "500" }}>{chargeResult.expenseType} </td>
                                        <td style={{textAlign:"end"}}>{chargeResult.totalCharges} </td>
                                        <td style={{textAlign:"end"}}>{chargeResult.totalAmount}</td>
                                    </tr>
                                )
                            }) 
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default results;



