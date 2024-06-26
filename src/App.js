import './index.css';
import AppBar from '@mui/material/AppBar';
import Nav from './nav';
import MyAsset from './mainPages/myAsset';
import BrowseHistory from './mainPages/bHistory';
import HotSale from './mainPages/hotSale';
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '@mui/material';
import { setWallet, setAssetBalances, setMyOrders, setSgdBalance, setReload, setHistories } from './redux/walletSlice';
import React, { useEffect, useState } from 'react';
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from 'web3';
import SmartContactController from './smartContractController';
import { setProperty } from './redux/propertySlice';
import CircularProgress from '@mui/material/CircularProgress';

const App = () => {
  const currentNav = useSelector(state => state.nav.currentNav);
  const wallet = useSelector(state => state.wallet.addr);
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(null);
  const loader = useSelector(state => state.loader.loader);
  const [smartContractController, setSmartContractController] = useState(null);
  const reload = useSelector(state => state.wallet.reload);

  // const smartContractController = SmartContactController();
  const dispatch = useDispatch();

  useEffect(() => {
    if (provider) {
      provider.on("accountsChanged", handleAccountsChanged);
    }
  }, [provider])

  useEffect(() => {
    if (!web3 && provider !== undefined && provider !== null) {
      const web3local = new Web3(provider)
      setWeb3(web3local);
      setSmartContractController(SmartContactController(web3local));
    }
  }, [web3, provider])

  useEffect(() => {
    reloadProperties();

    if (wallet && web3) {
      dispatch(setReload(true));
    }
  }, [wallet, web3]);

  useEffect(() => {
    if (reload && wallet) {
      dispatch(setReload(false));
      reloadUserAsset(wallet);
    }
  }, [wallet, reload])

  const reloadProperties = () => {
    const smcc = smartContractController ? smartContractController : SmartContactController()
    smcc.getTokensInfo()
      .then(res => {
        smcc.getOrders()
          .then(orders => {
            const map = {};
            orders.forEach(o => {
              if (!(o.token in map)) map[o.token] = [];
              map[o.token].push(o);
            });

            dispatch(setProperty(res.map(p => {
              return {
                properdyId: p.symbol,
                propertyNmae: p.name,
                size: p.supply,
                address: p.address,
                orders: p.address in map ? map[p.address] : []
              }
            })))
          });
      })
  }

  const reloadUserAsset = (wallet) => {
    reloadProperties();
    if (wallet) {
      smartContractController.getSGDbyAddress(wallet)
        .then(res => dispatch(setSgdBalance(res)))
        .catch(err => console.log(err));

      smartContractController.getTokenBalanceByAddress(wallet)
        .then(res => dispatch(setAssetBalances(res.filter(p => Number(p.balance) > 0))))
        .catch(err => console.log(err));

      smartContractController.getOrders()
        .then(res => {
          const myOrders = [];
          for (let i = 0; i < res.length; i++) {
            if (res[i]['seller'].toLowerCase() === wallet.toLowerCase()) myOrders.push(res[i]);
          }
          dispatch(setMyOrders(myOrders))
        })
        .catch(err => console.log(err));

        smartContractController.getHistories(wallet)
          .then(res=> dispatch(setHistories(res)))
          .catch(err => console.log(err));
    }
  }

  const renderMain = () => {
    switch (currentNav) {
      case 'hs':
        return <HotSale web3={web3} />
      case 'ma':
        return <MyAsset web3={web3} />
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
      <div style={{ position: 'absolute', height: '100vh', width: '100vw', top: 0, left: 0, zIndex: 1000, justifyContent: 'center', alignItems: 'center', display: loader ? 'flex' : 'none' }}>
        <div style={{ height: '100vh', width: '100vw', backgroundColor: 'black', opacity: '0.7', position: 'absolute', top: 0, left: 0 }} />
        <CircularProgress />
      </div>
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
