import SmartContactController from '../smartContractController';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import img from '../resources/img.jpg';
import '../index.css';
import { Button } from '@mui/material';

const MyAsset = (props) => {

    const wallet = useSelector(state => state.wallet.addr);
    const smartContractController = SmartContactController();
    const [sgdBalance, setSgdBalance] = useState("0.00");
    const [propertyAsset, setPropertyAsset] = useState([]);
    const properties = useSelector(state => state.property.properties)

    useEffect(() => {
        if (wallet) {
            smartContractController.getSGDbyAddress(wallet)
                .then(res => setSgdBalance(res))
                .catch(err => console.log(err));

            smartContractController.getTokenBalanceByAddress(wallet)
                .then(res => setPropertyAsset(res.filter(p => Number(p.balance) > 0)))
                .catch(err => console.log(err));
        }
    }, [wallet]);


    const render = () => {
        const propertiesMap = new Map(properties.map(i => [i.address, i]))
        return (
            <div style={{ padding: '20px' }}>
                <Typography gutterBottom variant="h3" component="div">
                    My MyAsset
                </Typography>
                <div className='flex-column' style={{ width: '100%' }}>
                    <Card style={{ marginBottom: '10px' }}>
                        <div style={{ padding: '10px', justifyContent: 'space-between' }} className='flex-row' >
                            <div>
                                <Typography variant="body2" color="text.secondary">
                                    <span style={{ fontWeight: 'bold' }}>SGD Balances: {sgdBalance}</span>
                                </Typography>
                            </div>
                        </div>
                    </Card>
                    {propertyAsset.length === 0 ? <div style={{ padding: '10px' }}> You dont have any property asset in your balance.</div> : propertyAsset.map((p, i) => (
                        <div key={i} style={{ marginBottom: '20px' }} className='flex-column'>
                            <Card className='flex-row'>
                                <img src={img} style={{ height: '200px' }} />
                                <CardContent className='flex-column' style={{justifyContent: 'space-between'}}>
                                    <div>
                                        <Typography gutterBottom variant="h5" component="div">
                                            {propertiesMap.get(p.address).propertyNmae}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Token Symbol: {propertiesMap.get(p.address).properdyId}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Size: {propertiesMap.get(p.address).size} Squer Feet
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Your Balance: {p.balance} units
                                        </Typography>
                                    </div>
                                    <div>
                                        <Button onClick={() => {
                                            console.log('sell');
                                        }}>Sell</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return render();
}

export default MyAsset;

