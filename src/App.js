import './index.css';
import AppBar from '@mui/material/AppBar';
import Nav from './nav';
import MyAsset from './mainPages/myAsset';
import BrowseHistory from './mainPages/bHistory';
import HotSale from './mainPages/hotSale';
import { useSelector } from 'react-redux'

const App = () => {
  const currentNav = useSelector(state => state.nav.currentNav);

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

  return (
    <div id='home'>
      <div id='header'>
        <AppBar className='fullfil flex-column' position="static" style={{ justifyContent: 'center' }}>
          <span style={{ fontSize: '30px', marginLeft: '30px' }}>Real Estate</span>
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
