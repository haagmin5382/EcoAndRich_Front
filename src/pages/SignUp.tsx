import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { reduxState } from 'App';
import AlertModal from 'components/Modal/AlertModal';
import { setModal } from 'redux/modal';

const theme = createTheme();

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmed, setPasswordConfirmed] = useState('');
  const dispatch = useDispatch();
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const userInfo = useSelector((state: reduxState) => state.user.value);

  if (userInfo.uid) {
    window.location.href = '/'; // 로그인 한 유저가 이 페이지에 들어오면 홈으로 보낸다.
  }

  const changeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e;
    if (e.target.name === 'email') {
      setEmail(value);
    } else if (e.target.name === 'password') {
      setPassword(value);
    } else {
      setPasswordConfirmed(value);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      email &&
      password &&
      passwordConfirmed &&
      password === passwordConfirmed
    ) {
      await createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          navigate('/login');
        })
        .catch((error) => {
          if (
            error.message === 'Firebase: Error (auth/email-already-in-use).'
          ) {
            dispatch(
              setModal({
                isOpen: true,
                modalMessage: '이미 존재하는 메일입니다.',
              }),
            );
          }
          if (
            error.message ===
            'Firebase: Password should be at least 6 characters (auth/weak-password).'
          ) {
            dispatch(
              setModal({
                isOpen: true,
                modalMessage: '비밀번호는 최소 6자리 이상이어야 합니다.',
              }),
            );
          }
        });
    } else if (password !== passwordConfirmed) {
      dispatch(
        setModal({
          isOpen: true,
          modalMessage: '비밀번호가 다릅니다.',
        }),
      );
    } else {
      dispatch(
        setModal({
          isOpen: true,
          modalMessage: '모든값은 필수 입니다.',
        }),
      );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AlertModal />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            회원 가입
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoComplete="email"
                  fullWidth
                  id="email"
                  label="이메일"
                  name="email"
                  onChange={changeInput}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  autoComplete="new-password"
                  fullWidth
                  id="password"
                  label="비밀번호"
                  name="password"
                  onChange={changeInput}
                  required
                  type="password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  autoComplete="confirm-password"
                  fullWidth
                  id="ConfirmPassword"
                  label="비밀번호 확인"
                  name="ConfirmPassword"
                  onChange={changeInput}
                  required
                  type="password"
                />
              </Grid>
            </Grid>
            <Button
              fullWidth
              sx={{ mt: 3, mb: 2 }}
              type="submit"
              variant="contained"
            >
              회원 가입
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  로그인
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
