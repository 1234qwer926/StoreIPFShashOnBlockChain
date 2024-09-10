import { useState } from 'react';
import { pinata } from "./config";
import { ethers } from "ethers";
import './App.css';

function App() {
  const [selectedfile, setselectedfile] = useState(null);
  const [ipfshash, setipfshash] = useState("");
  const [storedhash, setstoreshash] = useState("");
  const [url,seturl]=useState("");

  const contractAddress = "0x9875ee12c9152A77AE7d3390D335791a457Fb7d1";
  const contractAbi = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_ipfshash",
          "type": "string"
        }
      ],
      "name": "setIpfshash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getIpfshash",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const changehandler = function(event) {
    setselectedfile(event.target.files[0]);
  };

  const handlesubmission = async () => {
    const upload = await pinata.upload.file(selectedfile);
    console.log(upload);
    main(upload);
    const ipfshash = upload.cid;
    setipfshash(ipfshash);
    await storehashonblockchain(ipfshash);
  };

  const storehashonblockchain = async (hash) => {
    try {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      
      const tx = await contract.setIpfshash(hash);
      await tx.wait();
      console.log('Transaction successful:', tx);
    } catch (error) {
      console.error("Error storing hash on blockchain:", error);
    }
  };

  const retrivehashfromblockchain = async () => {
    try {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      
      const storedhash = await contract.getIpfshash();
      setstoreshash(storedhash);
    } catch (error) {
      console.error("Error retrieving hash from blockchain:", error);
    }
  };

  async function main(upload) {
    try {
      const data = await pinata.gateways.get(upload.cid);
      console.log(data);

      const url = await pinata.gateways.createSignedURL({
        cid: upload.cid,
        expires: 1800,
      });
      seturl(url);
      console.log(url);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h1>Welcome to the File Storing Application using IPFS on the Blockchain</h1>
      <div className='outer'>
      <div className="inner">
        <input type="file" onChange={changehandler} />
        <button onClick={handlesubmission}>Submit</button>
      </div>
      {ipfshash && (
        <div className='inner'>
          <p> The IPFS hash is {ipfshash} </p>
        </div>
      )}
      <div className='inner'>
        <button onClick={retrivehashfromblockchain}>Retrieve Stored Hash</button>
      </div>
      {storedhash && (
        <div className='inner'>The Stored Hash from the Blockchain is {storedhash}</div>
      )}
      <div className='inner'>
        <p>The File Stored on the pinata.
      <a href={url} target="_blank" rel="noopener noreferrer">
        Access File from here
      </a></p>
      </div>
      </div>
      
    </div>
  );
}

export default App;
