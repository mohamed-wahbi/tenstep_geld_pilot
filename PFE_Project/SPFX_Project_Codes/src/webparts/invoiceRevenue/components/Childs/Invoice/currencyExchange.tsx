import * as React from "react";
import { useEffect, useState } from "react";
import styles from "../../InvoiceRevenue.module.scss";
const AOS = require("aos");
import "aos/dist/aos.css";
import axios from "axios";

const BASE_URL = "https://api.exchangeratesapi.io/v1/latest?access_key=1984d013f983ce406897976882483d2a";

const CurrencyExchange: React.FC = () => {
  const [currencyOptions, setCurrencyOptions] = useState<string[]>([]);
  const [fromCurrency, setFromCurrency] = useState<string>("");
  const [toCurrency, setToCurrency] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [amount, setAmount] = useState<number>(1);
  const [amountInFromCurrency, setAmountInFromCurrency] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  let toAmount: string, fromAmount: string;
  if (amountInFromCurrency) {
    fromAmount = amount.toString();
    toAmount = exchangeRate ? (amount * exchangeRate).toFixed(4) : "";
  } else {
    toAmount = amount.toString();
    fromAmount = exchangeRate ? (amount / exchangeRate).toFixed(4) : "";
  }

  useEffect(() => {
    AOS.init({ duration: 1500, once: true });
    axios.get(BASE_URL)
      .then(response => {
        const data = response.data;
        if (data.rates) {
          const firstCurrency = Object.keys(data.rates)[0];
          setCurrencyOptions([data.base, ...Object.keys(data.rates)]);
          setFromCurrency(data.base);
          setToCurrency(firstCurrency);
          setExchangeRate(data.rates[firstCurrency]);
        } else {
          setError("Erreur lors de la récupération des taux de change.");
        }
      })
      .catch(() => setError("Impossible de récupérer les taux de change."));
  }, []);

  useEffect(() => {
    if (fromCurrency && toCurrency) {
      axios.get(`${BASE_URL}&base=${fromCurrency}&symbols=${toCurrency}`)
        .then(response => {
          const data = response.data;
          if (data.rates && data.rates[toCurrency]) {
            setExchangeRate(data.rates[toCurrency]);
          } else {
            setError("Erreur lors de la conversion.");
          }
        })
        .catch(() => setError("Impossible de récupérer les taux mis à jour."));
    }
  }, [fromCurrency, toCurrency]);

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseFloat(e.target.value));
    setAmountInFromCurrency(true);
  };

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseFloat(e.target.value));
    setAmountInFromCurrency(false);
  };

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}

      <div>
        <input
          type="number"
          className={styles.input}
          value={fromAmount}
          onChange={handleFromAmountChange}
          min="0"
        />
        <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
          {currencyOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className={styles.equals}>=</div>

      <div>
        <input
          type="number"
          className={styles.input}
          value={toAmount}
          onChange={handleToAmountChange}
          min="0"
        />
        <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
          {currencyOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CurrencyExchange;