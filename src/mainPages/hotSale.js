import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { Button } from '@mui/material';
import '../index.css';

import img from '../resources/img.jpg';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import SmartContactController from '../smartContractController';

const saleList = [];

for (let i = 0; i < 4; i++) {
    let list = [];
    for (let y = 0; y < 7 + i; y++) {
        list.push({
            propertyId: i,
            orderNum: i + '' + y,
            price: Math.floor(Math.random() * 20 + 95),
            amount: Math.floor(Math.random() * 300)
        })
    }

    saleList.push({
        properdyId: i,
        propertyNmae: 'Property ' + i,
        size: Math.floor(Math.random() * 300 + 600),
        floor: list.reduce((acc, nxt) => acc < nxt.price ? acc : nxt.price, Math.max),
        deals: list
    })
}

const HotSale = (props) => {
    const [colleps, setColleps] = useState(saleList.map(i => false));
    const wallet = useSelector(state => state.wallet.addr);
    const properties = useSelector(state => state.property.properties);

    const smartContractController = SmartContactController();

    useEffect(() => {

    }, [properties]);

    useEffect(() => {
        if (wallet) {

        }
    }, [wallet]);

    const getDeals = () => {
        // provider.reque

    }

    const renderDeals = (list) => {
        return (<List>
            {list.map((sale, i) => (
                <Card style={{ marginBottom: '10px' }}>
                    <div style={{ padding: '10px', justifyContent: 'space-between' }} className='flex-row' >
                        <div>
                            <Typography variant="body2" color="text.secondary">
                                <span style={{ fontWeight: 'bold' }}>Order Number: # {sale.orderNum}</span>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                price: {sale.price} $
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Units: {sale.amount} Squer Feet
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sub: {sale.amount * sale.price} $
                            </Typography>
                        </div>
                        <div className='flex-row' style={{ justifyContent: 'center' }}>
                            <Button>Buy</Button>
                        </div>
                    </div>
                </Card>
            ))}
        </List>)
    }

    return (<div style={{ padding: '20px' }}>
        <Typography gutterBottom variant="h3" component="div">
            Hot sale
        </Typography>
        <List>
            {properties.map((sli, i) => (
                <div style={{ marginBottom: '20px' }} className='flex-column'>
                    <Card className='flex-row'>
                        <img src={img} style={{ height: '200px' }} />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                {sli.propertyNmae}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Size: {sli.size} Squer Feet
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Floor Price: {sli.floor} $
                            </Typography>
                            <Button onClick={() => {
                                const newC = [...colleps];
                                newC[i] = !newC[i];
                                setColleps(newC);
                            }}>{colleps[i] ? 'Collaps' : 'See Deals'}</Button>
                        </CardContent>
                    </Card>
                    {colleps[i] ? (renderDeals(sli.deals)) : <div />}
                </div>
            ))}
        </List>
    </div>)
}

export default HotSale;

