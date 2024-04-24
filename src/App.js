import './index.css';
import AppBar from '@mui/material/AppBar';
import Nav from './nav';
import MyAsset from './mainPages/myAsset';
import BrowseHistory from './mainPages/bHistory';
import HotSale from './mainPages/hotSale';
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '@mui/material';
import { setWallet } from './redux/walletSlice';
import React, { useEffect, useState } from 'react';
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from 'web3';
import SmartContactController from './smartContractController';
import { setProperty } from './redux/propertySlice';

const App = () => {
  const currentNav = useSelector(state => state.nav.currentNav);
  const wallet = useSelector(state => state.wallet.addr);
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(null);

  const smartContractController = SmartContactController();
  const dispatch = useDispatch();

  useEffect(() => {
    if (provider) {
      provider.on("accountsChanged", handleAccountsChanged);
    }
  }, [provider])

  useEffect(() => {
    if (!web3) {
      setWeb3(new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545')));
    }
  }, [web3])

  useEffect(() => {
    smartContractController.getTokensInfo()
      .then(res => {
        console.log(res);
        dispatch(setProperty(res.map(p => {
          return {
            properdyId: p.symbol,
            propertyNmae: p.name,
            size: p.supply,
            address: p.address
          }
        })))
      })
      .catch(err => console.log(err));
  }, [wallet])

  const renderMain = () => {
    switch (currentNav) {
      case 'hs':
        return <HotSale />
      case 'ma':
        return <MyAsset />
      case 'bh':
        return <BrowseHistory />
    }
  }

  const connect = () => {
    const getProvider = () => {
      return new Promise((resolve, reject) => {
        if (provider) {
          resolve(provider)
        } else {
          detectEthereumProvider()
            .then(provider => {
              if (provider) {
                setProvider(provider)
                resolve(provider);
              } else {
                reject("no provider");
              }
            })
            .catch(err => reject(err));
        }
      })
    }

    getProvider()
      .then(provider => provider.request({ method: "eth_requestAccounts" }))
      .then(accounts => updateAccount(accounts))
      .catch(err => console.log(err));
  }

  const handleAccountsChanged = (accounts) => {
    updateAccount(accounts);
  }

  const updateAccount = (accounts) => {
    dispatch(setWallet(accounts.length === 0 ? '' : accounts[0]));
  }

  return (
    <div id='home'>
      <div id='header'>
        <AppBar className='fullfil flex-row' position="static" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '30px', marginLeft: '30px' }}>Real Estate</span>
          <div>
            <Button variant="contained" color="secondary" onClick={() => connect()}>{wallet ? wallet.substring(0, 4) + '...' + wallet.substring(wallet.length - 3) : 'Connect'}</Button>
          </div>
        </AppBar>
      </div>
      <div id='home-body'>
        <Nav />
        <div id='main'>
          {renderMain()}
        </div>
      </div>
    </div>
  );
}

export default App;
