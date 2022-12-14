import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import ForumIcon from '@mui/icons-material/Forum';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { useSelector, useDispatch } from 'react-redux';
import { openAndClose } from 'redux/menu';
import { useNavigate } from 'react-router-dom';
import { persistor } from '../../index';
import { authService } from 'fbase';
import { reduxState } from 'App';
import {
  addDoc,
  setDoc,
  doc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { dbService } from 'fbase';
import { today } from 'components/Timer/Timer';

export default function TemporaryDrawer() {
  interface pomoTypeInPomoInfo {
    TotalPomo: number;
    Date: string;
  }
  interface pomoInfoType {
    id: string;
    createdAt: number;
    creatorId: string;
    pomo: Array<pomoTypeInPomoInfo>;
    userName: string;
  }
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sideMenu = useSelector(
    (state: reduxState) => state.menu.value.sideMenu,
  );
  const userInfo = useSelector((state: reduxState) => state.user.value);
  const dayPomo = useSelector((state: reduxState) => state.pomo.value.dayPomo);
  const [isClickRecord, setIsClickRecord] = useState(false);
  const [pomoInfo, setPomoInfo] = useState<Array<pomoInfoType>>([]);
  const snapShotDB = async () => {
    await onSnapshot(collection(dbService, 'pomo'), (snapShot) => {
      const pomoArray = snapShot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPomoInfo(pomoArray as Array<pomoInfoType>); // ??? ?????? ??????????????? ???????????? ??????????????? ?????????.
    });
  };
  const userPomoObj = pomoInfo.filter((obj) => obj.creatorId === userInfo.uid);
  const pomoObj = {
    userName: userInfo.displayName,
    pomo: dayPomo,
    createdAt: Date.now(),
    creatorId: userInfo.uid, // ???????????? ???  ??????????????? ????????????.
  };

  const createOrModifyPomoDB = async () => {
    if (
      dayPomo[dayPomo.length - 1]?.TotalPomo > 0 &&
      !userPomoObj[0] &&
      userInfo.displayName
    ) {
      await addDoc(collection(dbService, 'pomo'), pomoObj);
    } else {
      if (userPomoObj[0]) {
        const pomos = userPomoObj[0].pomo;
        const isToday = pomos[pomos.length - 1].Date === today;
        const pomoRef = await collection(dbService, 'pomo');
        if (!isToday) {
          // ???????????? ?????? ???

          const newPomoData = Object.assign(userPomoObj[0], {
            pomo: [...userPomoObj[0]?.pomo, ...pomoObj?.pomo],
          });

          await setDoc(doc(pomoRef, userPomoObj[0].id), newPomoData);
        }
      }
    }
  };

  const toggleDrawer = (event: any) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    dispatch(openAndClose({ sideMenu: false }));
  };
  const goToPage = async (page: string) => {
    if (page === '?????????') {
      navigate('/login');
    }
    if (page === '????????????') {
      navigate('/signup');
    }
    if (page === '????????????') {
      authService.signOut();
      persistor.pause();
      persistor.flush().then(() => persistor.purge()); // localstorage ?????????
      navigate('/');
    }
    if (page === '???????????????') {
      navigate('/mypage');
    }
    if (page === '?????????') {
      navigate('/board');
    }
    if (page === '??????') {
      await createOrModifyPomoDB();
      setIsClickRecord(true);
      // navigate(`/record/${userPomoObj[0]?.id}`);
    }
  };
  // snapShotDB();
  useEffect(() => {
    snapShotDB();
    if (isClickRecord) {
      navigate(`/record/${userPomoObj[0]?.id}`);
      setIsClickRecord(false);
    }
  }, [isClickRecord]);
  const itemList = userInfo.email
    ? ['????????????', '???????????????']
    : ['?????????', '????????????'];
  const list = (anchor: string) => (
    <Box
      role="presentation"
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
    >
      <List>
        <CloseIcon
          onClick={toggleDrawer}
          onKeyDown={toggleDrawer}
          sx={{ position: 'relative', left: 210, cursor: 'pointer' }}
        />
        {itemList.map((text: string) => (
          <ListItem
            disablePadding
            key={text}
            onClick={toggleDrawer}
            onKeyDown={toggleDrawer}
          >
            <ListItemButton onClick={() => goToPage(text)}>
              <ListItemIcon>
                {text === '?????????' && <LoginIcon />}
                {text === '????????????' && <LogoutIcon />}
                {text === '????????????' && <PersonAddAltIcon />}
                {text === '???????????????' && <PersonOutlineIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['?????????', '??????'].map((text) => (
          <ListItem disablePadding key={text}>
            <ListItemButton onClick={() => goToPage(text)}>
              <ListItemIcon>
                {text === '?????????' && <ForumIcon />}
                {text === '??????' && <ShowChartIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
      <>
        <Drawer anchor="right" onClose={toggleDrawer} open={sideMenu}>
          {list('right')}
        </Drawer>
      </>
    </div>
  );
}
