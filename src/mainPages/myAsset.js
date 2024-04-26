import SmartContactController from '../smartContractController';
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import img from '../resources/img.jpg';
import '../index.css';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import { setLoader } from '../redux/loaderSlice';
import { setReload } from '../redux/walletSlice';

const MyAsset = (props) => {

    const wallet = useSelector(state => state.wallet.addr);
    const sgdBalance = useSelector(state => state.wallet.sgdBalance);
    const propertyAsset = useSelector(state => state.wallet.assetBalances);
    const properties = useSelector(state => state.property.properties);
    const [dialogOpen, setDialogOpen] = useState({ open: false });
    const [propertyAssetList, setPropertyAssetList] = useState([]);
    const [orderDetails, setOrderDetails] = useState({ units: "0", price: "0" })
    const [smartContractController, setSmartContractController] = useState(null);
    const myOrders = useSelector(state => state.wallet.myOrders);
    const dispatch = useDispatch();

    useEffect(() => {
        if (wallet && props.web3) {
            setSmartContractController(SmartContactController(props.web3));
        }
    }, [props, wallet])

    useEffect(() => {
        if (properties.length > 0 && propertyAsset.length > 0) {
            const propertiesMap = Object.fromEntries(new Map(properties.map(i => [i.address, i])));
            const myOrderMap = {};
            myOrders.forEach(o => {
                if (!(o.token in myOrderMap)) myOrderMap[o.token] = [];
                myOrderMap[o.token].push(o);
            });
            setPropertyAssetList(propertyAsset.map(p => {
                return { ...propertiesMap[p.address], balance: p.balance, orders: myOrderMap[p.address] }
            }));
        }
    }, [propertyAsset, properties, myOrders])

    const renderSellDialog = () => {
        return (
            <Dialog
                open={dialogOpen.open}
                onClose={() => console.log('sell dialog closed')}
                aria-labelledby="sellDialog"
                aria-describedby="sellDialog to display sell details"
            >
                {dialogOpen.target ? (
                    <div>
                        <DialogTitle id="sellDialogTitle">
                            {"Please fill in sell order details"}
                        </DialogTitle>
                        <DialogContent>
                            <FormControl variant="standard" sx={{ m: 1, mt: 3, width: '25ch' }}>
                                <Input
                                    error={orderDetails['units'] > Number(dialogOpen.target["balance"])}
                                    id="units-to-sell"
                                    type="number"
                                    value={orderDetails.units}
                                    endAdornment={<InputAdornment position="end">units</InputAdornment>}
                                    aria-describedby="units-to-sell-helper"
                                    inputProps={{
                                        'aria-label': 'units',
                                    }}
                                    onChange={e => setOrderDetails({ ...orderDetails, units: e.target.value.length - e.target.value.indexOf('.') > 3 && e.target.value.indexOf('.') > -1 ? e.target.value.substring(0, e.target.value.indexOf('.') + 4) : e.target.value })}
                                />
                                <FormHelperText id="standard-weight-helper-text">Units to Sell (Max: {dialogOpen.target.balance})</FormHelperText>
                            </FormControl>
                            <FormControl variant="standard" sx={{ m: 1, mt: 3, width: '25ch' }}>
                                <Input
                                    // error={orderDetails['units'] > Number(dialogOpen.target["balance"])}
                                    id="price-to-sell"
                                    type="number"
                                    value={orderDetails.price}
                                    endAdornment={<InputAdornment position="end">dollors</InputAdornment>}
                                    aria-describedby="price-to-sell-helper"
                                    inputProps={{
                                        'aria-label': 'price per unit',
                                    }}
                                    onChange={e => setOrderDetails({ ...orderDetails, price: e.target.value.length - e.target.value.indexOf('.') > 3 && e.target.value.indexOf('.') > -1 ? e.target.value.substring(0, e.target.value.indexOf('.') + 3) : e.target.value })}
                                />
                                <FormHelperText id="standard-weight-helper-text">price per unit</FormHelperText>
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => closeDialog()}>Cancel</Button>
                            <Button onClick={() => placeOrder()}>Place Sell Order</Button>
                        </DialogActions></div>
                ) : null}
            </Dialog>
        )
    }

    const closeDialog = () => {
        setDialogOpen({ open: false })
        setOrderDetails({ units: "0", price: "0" });
    }

    const placeOrder = () => {
        dispatch(setLoader(true));
        smartContractController.placeOrder(wallet, dialogOpen.target.address, Number(orderDetails.price), Number(orderDetails.units))
            .then(res => {
                dispatch(setLoader(false));
                dispatch(setReload(true));
            })
            .catch(err => {
                dispatch(setLoader(false))
            });
        closeDialog();
    }

    const cancelOrder = (id) => {
        dispatch(setLoader(true));
        smartContractController.cancelOrder(id, wallet)
            .then(res => {
                dispatch(setLoader(false));
                dispatch(setReload(true));
            })
            .catch(err => {
                dispatch(setLoader(false))
            });
    }

    const render = () => {
        return (
            <div style={{ padding: '20px' }}>
                {renderSellDialog()}
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
                    {propertyAssetList.length === 0 ? <div style={{ padding: '10px' }}> You dont have any property asset in your balance.</div> : propertyAssetList.map((p, i) => (
                        <div key={i} style={{ marginBottom: '20px' }} className='flex-column'>
                            <Card className='flex-row'>
                                <img src={img} style={{ height: '200px' }} />
                                <CardContent className='flex-column' style={{ justifyContent: 'space-between' }}>
                                    <div>
                                        <Typography gutterBottom variant="h5" component="div">
                                            {p.propertyNmae}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Token Symbol: {p.properdyId}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Size: {p.size} Squer Feet
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Your Balance: {p.balance} units
                                        </Typography>
                                    </div>
                                    <div>
                                        <Button onClick={() => setDialogOpen({ open: true, target: p })}>Sell</Button>
                                    </div>
                                </CardContent>
                            </Card>
                            {p.orders && p.orders.length > 0 ? (
                                <div style={{ marginTop: '8px' }}>
                                    <Typography gutterBottom variant="h6" component="div">
                                        Oder List
                                    </Typography>
                                    {p.orders.map(o => (
                                        <Card key={o.id} className='flex-row' style={{ marginBottom: '10px' }}>
                                            <CardContent className='flex-column' style={{ justifyContent: 'space-between' }}>
                                                <div>
                                                    <Typography gutterBottom variant="h7" component="div">
                                                        Order ID: {o.id}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Units remain in order: {(o.amount * 0.1 ** 3).toFixed(3)} Square feets
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Unit Price: {(o.pricePerToken * 0.1 ** 5).toFixed(2)} $ / Square feets
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Subtotal remaining: {((o.amount * 0.1 ** 3) * (o.pricePerToken * 0.1 ** 5)).toFixed(2)} $
                                                    </Typography>
                                                </div>
                                                <div>
                                                    <Button onClick={() => cancelOrder(o.id)}>Cancel Order</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : null}

                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return render();
}

export default MyAsset;

