import './index.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useSelector, useDispatch } from 'react-redux'
import { setCurrent } from './redux/navSlice';

const Nav = () => {
    const navItems = useSelector(state => state.nav.navs);
    const dispatch = useDispatch()

    return (<div id='nav'>
        <List>
            {Object.values(navItems).map((navItem, i) => (
                <ListItem key={navItem.name + i} disablePadding onClick={() => dispatch(setCurrent(navItem.id))}>
                    <ListItemButton>
                        <ListItemText primary={navItem.name} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    </div>)
}

export default Nav;