import React, { useState, useEffect } from "react";
import "./App.css";
import { getWeb3 } from "./utils";
import "./styles.css";
import {
  days as daysOption,
  hours as hoursOption,
  minutes as minutesOption
} from "./options";
const aztec = require("aztec.js");

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);
  const [network, setNetwork] = useState(undefined);
  const [amount, setAmount] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [duration, setDuration] = useState(null);
  const [days, setDays] = useState(null);
  const [hours, setHours] = useState(null);
  const [minutes, setMinutes] = useState(null);

  useEffect(() => {
    const init = async () => {
      const _web3 = await getWeb3();
      const accounts = await _web3.eth.getAccounts();
      let _network = await _web3.eth.net.getId();
      setNetwork(_network);

      /*const _contract = new web3.eth.Contract(
       Multisig.abi,
        deployedNetwork && deployedNetwork.address, 
      ); */
      console.log("web3", _web3);
      console.log("aztec", aztec);
      console.log("windowaztec", window.aztec);
      setWeb3(_web3);
      setAccounts(accounts);
      //setContract(_contract);
    };
    init();
    /*
    window.ethereum.on("accountsChanged", accounts => {
      setAccounts(accounts);
    });
    */
  }, []);

  useEffect(() => {
    console.log("minutes", minutes);
  }, [minutes]);

  return (
    <div className="App">
      <div style={{ width: 500, margin: "auto", marginTop: 150 }}>
        <div className="input-wrap">
          <label>How much do you want to stream?</label>
          <input
            type="text"
            onChange={val => setAmount(val.target.value)}
            value={amount}
            placeholder="0 Dai"
          />
        </div>
        <div className="input-wrap">
          <label>Who is the recipient?</label>
          <input
            type="text"
            onChange={val => setRecipient(val.target.value)}
            value={recipient}
            placeholder="0xe065D88f41615231e69026040C075d9F9F1bD00A"
          />
        </div>
        <label style={{ textAlign: "left" }}>
          For how long do you want to stream?
        </label>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignSelf: "center"
          }}
        >
          <div className="input-wrap select-wrap">
            <label>Days</label>
            <select value={days} onChange={val => setDays(val.target.value)}>
              {daysOption.map(option => (
                <option key={option.id} value={option.title}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>

          <div className="input-wrap select-wrap">
            <label>Hours</label>
            <select value={hours} onChange={val => setHours(val.target.value)}>
              {hoursOption.map(option => (
                <option key={option.id} value={option.title}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>
          <div className="input-wrap select-wrap">
            <label>Minutes</label>
            <select
              value={minutes}
              onChange={val => setMinutes(val.target.value)}
            >
              {minutesOption.map(option => (
                <option key={option.id} value={option.title}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="backbutton"
          style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
        >
          <button onClick={() => window.close()}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
