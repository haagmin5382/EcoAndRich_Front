import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { reduxState } from 'App';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { authService, storageService } from 'fbase';
import { updatePassword, updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { useDispatch } from 'react-redux';
import { userReducer } from 'redux/user';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import { getAuth, deleteUser } from 'firebase/auth';
import PageError from './pageForError/PageForNotLogin';
import AlertModal from 'components/Modal/AlertModal';
import { setModal } from 'redux/modal';
import CheckingModal from 'components/Modal/CheckingModal';

const MypageBackground = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.5;
`;

const ProfileContainer = styled.div`
  width: 30vw;
  margin: 0 auto;
  text-align: center;

  h1 {
    margin-top: 0vh;
    font-size: 5vw;
  }
  @media screen and (max-width: 500px) {
    width: 50vw;
    font-size: 10px;
    h1 {
      font-size: 10vw;
    }
  }

  Button {
    @media screen and (max-width: 500px) {
      font-size: 10px;
    }
  }
`;

function Mypage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const userProfile = useSelector((state: reduxState) => state.user.value);
  const [newDisplayName, setNewDisplayName] = useState(userProfile.displayName);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordCheck, setNewPasswordCheck] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState(userProfile.photoURL);
  const [isCheckingModalOpen, setIsCheckingModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const changeDisplayName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e;
    setNewDisplayName(value);
  };
  const changePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;

    if (name === 'newPassword') {
      setNewPassword(value);
    } else {
      setNewPasswordCheck(value);
    }
  };

  const refreshUser = () => {
    // ???????????? ???????????? ??? ???????????? ????????????
    dispatch(
      userReducer({
        email: user?.email,
        displayName: user?.displayName,
        photoURL: user?.photoURL,
        uid: user?.uid,
        isOauth: user?.providerData[0].providerId === 'password' ? false : true,
      }),
    );
  };

  const changeProfilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = e;
    // const { files } = eventTarget;

    let theFile;
    if (files) {
      theFile = files[0];
    }

    const reader = new FileReader();
    reader.onloadend = (finishedEvent: any) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setNewPhotoURL(result); // ???????????? ????????? ??????
    }; // ?????? ????????? ?????? ??? finishedEvent??? ?????????.
    if (theFile) {
      reader.readAsDataURL(theFile); // readAsDataURL??? ???????????? ????????? ?????????. (????????? ?????? ????????????)
    }
    e.target.value = '';
  };

  const editProfile = async () => {
    if (newDisplayName && authService.currentUser !== null) {
      // ????????? ??????
      await updateProfile(authService.currentUser, {
        displayName: newDisplayName,
      });
    }
    let attachmentURL;
    if (
      userProfile.photoURL !== newPhotoURL &&
      authService.currentUser !== null
    ) {
      // ????????? ?????? ??????
      const attachmentRef: any = ref(storageService, `${userProfile.uid}`);
      await uploadString(attachmentRef, newPhotoURL, 'data_url');

      attachmentURL = await getDownloadURL(ref(storageService, attachmentRef));
      await updateProfile(authService.currentUser, {
        photoURL: attachmentURL || newPhotoURL,
      });
    }
    if (
      newPassword.length >= 6 &&
      newPasswordCheck.length >= 6 &&
      newPassword === newPasswordCheck &&
      authService.currentUser !== null
    ) {
      // ???????????? ??????
      await updatePassword(authService.currentUser, newPassword);
      navigate('/');
    } else if (newPassword !== newPasswordCheck) {
      dispatch(
        setModal({ isOpen: true, modalMessage: '??????????????? ????????????.' }),
      );
    } else if (
      newPassword.length < 6 &&
      newPasswordCheck.length < 6 &&
      newPassword
    ) {
      dispatch(
        setModal({
          isOpen: true,
          modalMessage: '??????????????? ?????? 6?????? ??????????????? ?????????.',
        }),
      );
    }

    refreshUser();
  };
  const withdraw = async () => {
    if (user) {
      await deleteUser(user);
      navigate('/');
    }
    // setIsModalOpen(true);
  };
  // const clickButton = (e: React.MouseEvent<HTMLElement>) => {
  //   setIsCheckingModalOpen(true);
  //   const eventTarget = e.target as HTMLInputElement;
  //   console.log(eventTarget.name);
  //   if (eventTarget.name === 'editing') {
  //     setIsEditing(true);
  //   } else {
  //     setIsEditing(false);
  //   }
  // };
  return (
    <>
      <AlertModal />
      <CheckingModal
        isCheckingModalOpen={isCheckingModalOpen}
        isEditing={isEditing}
        setIsCheckingModalOpen={setIsCheckingModalOpen}
      />
      {userProfile.uid ? (
        <>
          <MypageBackground
            alt="mypageImg"
            src={
              process.env.PUBLIC_URL +
              `./Images/samantha-gades-BlIhVfXbi9s-unsplash.jpg`
            }
          />
          <ProfileContainer>
            <h1>My Profile</h1>
            <form>
              <label htmlFor="profilePhoto" style={{ display: 'inline-block' }}>
                <Avatar
                  src={newPhotoURL ? newPhotoURL : userProfile.photoURL}
                  sx={{
                    margin: '0 auto',
                    width: '200px',
                    height: '200px',
                    cursor: 'pointer',
                  }}
                />
              </label>
            </form>

            <input
              accept="image/*"
              id="profilePhoto"
              onChange={changeProfilePhoto}
              style={{ display: 'none' }}
              type="file"
            />
            <TextField
              autoComplete="displayName"
              fullWidth
              id="displayName"
              label={userProfile.displayName}
              margin="normal"
              name="displayName"
              onChange={changeDisplayName}
              required
              sx={{
                fontSize: 'small',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
              }}
            />
            {userProfile.isOauth ? null : (
              <div>
                <TextField
                  autoComplete="newPassword"
                  fullWidth
                  id="newPassword"
                  label={'????????????'}
                  margin="normal"
                  name="newPassword"
                  onChange={changePassword}
                  required
                  sx={{
                    fontSize: 'small',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                  }}
                  type="password"
                />
                <TextField
                  autoComplete="newPasswordCheck"
                  fullWidth
                  id="newPasswordCheck"
                  label={'???????????? ??????'}
                  margin="normal"
                  name="newPasswordCheck"
                  onChange={changePassword}
                  required
                  sx={{
                    fontSize: 'small',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                  }}
                  type="password"
                />
              </div>
            )}

            <Button
              fullWidth
              name="editing"
              onClick={editProfile}
              sx={{ mt: 3, mb: 2, fontSize: 'large' }}
              variant="contained"
            >
              ???????????? ??????
            </Button>
            <Button
              fullWidth
              name="withdrawal"
              onClick={withdraw}
              sx={{
                mt: 1,
                mb: 2,
                fontSize: 'large',
                backgroundColor: '#F53829',
                ':hover': { backgroundColor: '#EAA8A3' },
              }}
              variant="contained"
            >
              ?????? ??????
            </Button>
          </ProfileContainer>{' '}
        </>
      ) : (
        <PageError />
      )}
    </>
  );
}

export default Mypage;
