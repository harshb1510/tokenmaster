import { useEffect,useState } from 'react';
import { ethers } from 'ethers';
import TokenMaster from './abis/TokenMaster.json' 
import './App.css';
import Navigation from './components/Navigation'
import Card from './components/Card'
import config from './config.json'
import Sort from './components/Sort'
import SeatChart from './components/SeatChart'


function App() {
  const [account,setAccount] = useState(null);
  const [provider,setProvider] = useState(null);
  const [tokenMaster,setTokenMaster] = useState(null);
  const [occasions,setOccasions] = useState(null);
  const [occasion,setOccasion] = useState(null);
  const [toggle,setToggle] = useState(false);
  const loadBlockchainData = async()=>{
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);
   

    const network = await provider.getNetwork();
    const contractAddress = config[network.chainId].TokenMaster.address
    

    const tokenMaster = new ethers.Contract(contractAddress,TokenMaster,provider)
    setTokenMaster(tokenMaster);
  
    const totalOcassions = await tokenMaster.totalOccasions();

    const occasions = [];
    for(let i = 1;i<=totalOcassions;i++){
      const occasion = await tokenMaster.getOcassion(i);
      occasions.push(occasion);
    }
    setOccasions(occasions);
    console.log(occasions[0].name)


    window.ethereum.on('accountsChanged',async()=>{
      const accounts = await window.ethereum.request({method:'eth_requestAccounts'})
      const account = ethers.getAddress(accounts[0]);
      setAccount(account);
    })
  }
  useEffect(()=>{
     loadBlockchainData()
  },[])
  return (
    <div className="App">
      <header>
        <Navigation account={account} setAccount={setAccount}/>
        <h2 className='header__title'>Event</h2>
      </header>
      <div className='cards'>
        <Sort/>
        {occasions?.map((occasion,index)=>(
          <Card
          occasion={occasion}
          id={index+1}
          tokenMaster={tokenMaster}
          provider={provider}
          account={account}
          toggle={toggle}
          setToggle={setToggle}
          setOccasion={setOccasion}
          key={index}
          />
        ))}
      </div>
      {
        toggle&&(
          <SeatChart
          occasion={occasion}
          tokenMaster={tokenMaster}
          provider={provider}
          setToggle={setToggle}
          />
        )
      }
    </div>
  );
}

export default App;
