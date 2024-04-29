import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { Button } from '@mui/material';
import '../index.css';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';

import img from '../resources/img.jpg';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import SmartContactController from '../smartContractController';
import { setReload } from '../redux/walletSlice';
import { setLoader } from '../redux/loaderSlice';

const HotSale = (props) => {
    const wallet = useSelector(state => state.wallet.addr);
    const properties = useSelector(state => state.property.properties);
    const [colleps, setColleps] = useState(properties.map(i => false));
    const sgdBalance = useSelector(state => state.wallet.sgdBalance);
    const [dialogOpen, setDialogOpen] = useState({ open: false });
    const [orderDetails, setOrderDetails] = useState({ units: "0" })
    const [smartContractController, setSmartContractController] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        if (wallet && props.web3) {
            setSmartContractController(SmartContactController(props.web3));
        }
    }, [props, wallet])

    const closeDialog = () => {
        setDialogOpen({ open: false })
        setOrderDetails({ units: "0" });
    }

    const fulfillOrder = (id, units, price, seller) => {
        dispatch(setLoader(true));
        smartContractController.fulfillOrder(wallet, id, units, price, seller)
            .then(res => {
                dispatch(setLoader(false));
                dispatch(setReload(true));
            })
            .catch(err => {
                dispatch(setLoader(false))
            });
        closeDialog();
    }

    const renderBuyDialog = () => {
        const max = dialogOpen.open ? (sgdBalance / (dialogOpen.target.pricePerToken * 0.1 ** 5)).toFixed(3) : 0;
        return (
            <Dialog
                open={dialogOpen.open}
                onClose={() => console.log('fulfill dialog closed')}
                aria-labelledby="fulfillDialog"
                aria-describedby="fulfillDialog to display fulfill details"
            >
                {dialogOpen.target ? (
                    <div>
                        <DialogTitle id="fulfillialogTitle">
                            {"Please fill in units to fulfill"}
                        </DialogTitle>
                        <DialogContent className='flex-column'>
                            <FormControl variant="standard" sx={{ m: 1, mt: 3, width: '25ch' }}>
                                <Input
                                    error={orderDetails['units'] > (dialogOpen.target.amount * 0.1 ** 3).toFixed(3)}
                                    id="units-to-complete"
                                    type="number"
                                    value={orderDetails.units}
                                    endAdornment={<InputAdornment position="end">units</InputAdornment>}
                                    aria-describedby="units-to-complete-helper"
                                    inputProps={{
                                        'aria-label': 'units',
                                    }}
                                    onChange={e => setOrderDetails({ units: e.target.value.length - e.target.value.indexOf('.') > 3 && e.target.value.indexOf('.') > -1 ? e.target.value.substring(0, e.target.value.indexOf('.') + 4) : e.target.value })}
                                />
                                <FormHelperText id="standard-weight-helper-text" className='flex-column'>
                                    <span>
                                        Units to fulfill (Max: {max})
                                    </span>
                                    <span>
                                        Total cost in SGD {(Number(orderDetails.units) * dialogOpen.target.pricePerToken * 0.1 ** 5).toFixed(2)}
                                    </span>
                                </FormHelperText>
                            </FormControl>
                            <Button onClick={() => setOrderDetails({ units: max })}>Max</Button>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => closeDialog()}>Cancel</Button>
                            <Button onClick={() => fulfillOrder(dialogOpen.target.id, orderDetails.units, dialogOpen.target.pricePerToken, dialogOpen.target.seller)}>Fulfill Order</Button>
                        </DialogActions></div>
                ) : null}
            </Dialog>
        )
    }

    const renderDeals = (list) => {
        return (<List>
            {list.map((o, i) => (
                <Card style={{ marginBottom: '10px' }}>
                    <div style={{ padding: '10px', justifyContent: 'space-between' }} className='flex-row' >
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
                                Subtotal: {((o.amount * 0.1 ** 3) * (o.pricePerToken * 0.1 ** 5)).toFixed(2)} $
                            </Typography>
                        </div>
                        <div className='flex-row' style={{ justifyContent: 'center' }}>
                            {wallet && Number(sgdBalance) > (0.001 * (o.pricePerToken * 0.1 ** 5)).toFixed(2) ?
                                <Button onClick={() => setDialogOpen({ open: true, target: o })}>Buy</Button>
                                : <div>{wallet ? 'Insufficent SGD Balance' : 'Please connect wallet to buy'}</div>
                            }
                        </div>
                    </div>
                </Card>
            ))}
        </List>)
    }

    return (<div style={{ padding: '20px' }}>
        {renderBuyDialog()}
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
                                Floor Price: {sli.orders.length > 0 ? (sli.orders.reduce((acc, next) => (acc > parseInt(next.pricePerToken) ? acc : parseInt(next.pricePerToken)), Math.max()) * 0.1 ** 5).toFixed(2) : 'NA'}
                            </Typography>
                            {sli.orders.filter(o => o.seller.toLowerCase() !== (wallet ? wallet.toLowerCase() : '')).length > 0 ? (
                                <Button onClick={() => {
                                    const newC = [...colleps];
                                    newC[i] = !newC[i];
                                    setColleps(newC);
                                }}>{colleps[i] ? 'Collaps' : 'See Deals'}</Button>
                            ) : <div>No deal at this moment</div>}
                        </CardContent>
                    </Card>
                    {sli.orders.filter(o => o.seller.toLowerCase() !== (wallet ? wallet.toLowerCase() : '')).length > 0 && colleps[i] ? (renderDeals(sli.orders)) : <div />}
                </div>
            ))}
        </List>
    </div>)
}

export default HotSale;

