// `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`

import { useEffect, useState } from "react";

export default function App() {
  const [countries, setCountries] = useState([]);
  const [to, setTo] = useState(null);
  const [from, setFrom] = useState(null);
  const [currencyValue, setCurrencyValue] = useState(null);
  const [convertedCurrency, setConvertedCurrency] = useState(null);
  const [error, setError] = useState("");

  function handleCurrencyValue(e) {
    setCurrencyValue(e.target.value);
  }

  function handleSetFrom(e) {
    setFrom(e.target.value);
  }

  function handleSetTo(e) {
    setTo(e.target.value);
  }

  // Get list of countries API has data for
  useEffect(function () {
    async function countryList() {
      const res = await fetch(`https://api.frankfurter.app/latest`);
      const data = await res.json();
      setCountries((countries) => Object.keys(data.rates));
    }
    countryList();
  }, []);

  // Converts the currency from users to and from selection
  useEffect(
    function () {
      const controller = new AbortController();
      async function getConversion() {
        try {
          if (!currencyValue || !to || !from) return;
          if (isNaN(currencyValue))
            throw new Error(`${currencyValue} is not a valid number.`);
          if (to === from)
            throw new Error("Conversion to and from can not be the same.");
          const res = await fetch(
            `https://api.frankfurter.app/latest?amount=${+currencyValue}&from=${from}&to=${to}`,
            { signal: controller.signal }
          );
          const data = await res.json();

          setConvertedCurrency(data.rates[to]);
          setError("");
        } catch (err) {
          setError(err.message);
        }
      }
      getConversion();

      return function () {
        controller.abort();
      };
    },
    [currencyValue, to, from]
  );

  function createSelection() {
    return countries.map((country) => (
      <option value={country} key={country}>
        {country}
      </option>
    ));
  }

  return (
    <div className="main">
      <input type="text" onChange={(e) => handleCurrencyValue(e)} />
      <select onChange={(e) => handleSetFrom(e)}>
        <option hidden>From</option>
        {createSelection()}
      </select>
      <select onChange={(e) => handleSetTo(e)}>
        <option hidden>To</option>
        {createSelection()}
      </select>
      {error ? (
        <p>{error}</p>
      ) : (
        currencyValue &&
        to &&
        from && (
          <>
            <p>
              Your {currencyValue} from {from} to {to} is:
            </p>
            <p>{convertedCurrency}</p>
          </>
        )
      )}
    </div>
  );
}
