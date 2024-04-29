import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { useSelector } from 'react-redux';


const BrowseHistory = () => {
    const histories = useSelector(state => state.wallet.history);
    const wallet = useSelector(state => state.wallet.addr);

    console.log(wallet);
    console.log(histories);

    return (
        <div style={{ padding: '20px' }}>
            <Typography gutterBottom variant="h3" component="div">
                Your History trade
            </Typography>

            {histories.map((h, i) => 
                <Card key={i} style={{ marginBottom: '10px' }}>
                    <div style={{ padding: '10px', justifyContent: 'space-between' }} className='flex-row' >
                        <div>
                            <Typography gutterBottom variant="h7" component="div">
                                Order ID: {h.id}
                            </Typography>
                            <Typography gutterBottom variant="h7" component="div">
                                type: {wallet.toLowerCase() === h.buyer.toLowerCase() ? "Buy" : "Sell"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Unit Price: {(h.pricePerToken * 0.1 ** 5).toFixed(2)} $ / Square feets
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Amount: {(h.amount * 0.1 ** 3).toFixed(2)} Units
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Subtotal: {((h.amount * 0.1 ** 3) * (h.pricePerToken * 0.1 ** 5)).toFixed(2)} $
                            </Typography>
                            {/* <Typography variant="body2" color="text.secondary">
                                Completed Time Stemp: {new Date(Number(h.timestamp)).toISOString().slice(0, 10)}
                            </Typography> */}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}

export default BrowseHistory;

