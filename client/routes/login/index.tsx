import * as React from 'react';
const { useState, useReducer, useCallback } = React;
import styled from 'styled-components';
import {
  Avatar,
  Paper,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Link
} from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import EnhancedEncryptionIcon from '@material-ui/icons/EnhancedEncryption';
import { useHistory } from 'react-router-dom';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { IBaseResponse } from '../../typings/Todo';

const LoginContainer = styled.main`
  width: 100%;
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
  padding-left: 16px;
  padding-right: 16px;

  @media (min-width: 600px) {
    padding-left: 24px;
    padding-right: 24px;
  }
  @media (min-width: 0px) {
    max-width: 444px;
  }
`;

const LoginContent = styled.section`
  display: flex;
  margin-top: 64px;
  align-items: center;
  flex-direction: column;
`;

const useStyles = makeStyles(theme => ({
  red: {
    margin: '8px',
    backgroundColor: 'rgb(220, 0, 78)'
  },
  form: {
    width: '100%',
    marginTop: '8px'
  },
  field: {
    width: '100%',
    marginTop: '16px',
    marginBottom: '8px'
  },
  submit: {
    margin: '24px 0px 16px',
    fontSize: '0.875rem'
  }
}));

const customStyles = ({ palette, spacing }: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      padding: spacing.unit,
      backgroundColor: palette.background.default,
      color: palette.primary.main
    }
  });

interface IUser {
  name?: string;
  username: string;
  password: string;
  email?: string;
  mobile?: string;
}

interface IAction {
  type: 'username' | 'name' | 'password' | 'email' | 'mobile';
  value: string;
}

export function LoginPage() {
  const classes = useStyles();
  const [remember, setRemember] = useState(false);
  const history = useHistory();

  return (
    <LoginContainer>
      <LoginContent>
        <Avatar className={classes.red}>
          <EnhancedEncryptionIcon />
        </Avatar>
        <Typography variant="h5">Sign in</Typography>
        <Paper component="form" elevation={0} className={classes.form}>
          <TextField
            label="Username"
            variant="outlined"
            required
            className={classes.field}
          />
          <TextField
            label="Password"
            variant="outlined"
            required
            className={classes.field}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={remember}
                onChange={() => setRemember(!remember)}
                value="antoine"
              />
            }
            label="Remember me"
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth={true}
            className={classes.submit}
          >
            SIGN IN
          </Button>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Link href="#">Forgot password?</Link>
            </Grid>
            <Grid item xs={6}>
              <Link href="#" onClick={() => history.push('/signup')}>
                Don't have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </Paper>
      </LoginContent>
    </LoginContainer>
  );
}

const REGISTER_USER = gql`
  mutation AddUser($user: UserInput) {
    addUser(user: $user) {
      code
      success
      message
    }
  }
`;

export function SignUp() {
  const classes = useStyles();
  const {
    user,
    setUsername,
    setPassword,
    setName,
    setEmail,
    setMobile
  } = useUser({
    name: '',
    username: '',
    password: '',
    email: ''
  });

  const [addUser, { error, data }] = useMutation<
    { addUser: IBaseResponse },
    { user: IUser }
  >(REGISTER_USER);

  return (
    <LoginContainer>
      <LoginContent>
        <Avatar className={classes.red}>
          <EnhancedEncryptionIcon />
        </Avatar>
        <Typography variant="h5">Sign up</Typography>
        <Paper component="form" elevation={0} className={classes.form}>
          <TextField
            label="Username"
            variant="outlined"
            required
            className={classes.field}
            value={user.username}
            onChange={setUsername}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            required
            className={classes.field}
            value={user.password}
            onChange={setPassword}
          />
          <TextField
            label="Name"
            variant="outlined"
            className={classes.field}
            value={user.name}
            onChange={setName}
          />
          <TextField
            label="Mobile"
            variant="outlined"
            required
            className={classes.field}
            value={user.mobile}
            onChange={setMobile}
          />
          <TextField
            label="Email Address"
            variant="outlined"
            required
            className={classes.field}
            value={user.email}
            onChange={setEmail}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth={true}
            className={classes.submit}
            onClick={() => addUser({ variables: { user } })}
          >
            SIGN UP
          </Button>
          <Grid container spacing={3} alignContent="flex-end">
            <Grid item xs={6}>
              <Link href="#">Don't have an account? Sign Up</Link>
            </Grid>
          </Grid>
        </Paper>
      </LoginContent>
    </LoginContainer>
  );
}

const reducer = (state: IUser, action: IAction) => {
  switch (action.type) {
    case 'username':
      return { ...state, username: action.value };
    case 'password':
      return { ...state, password: action.value };
    case 'name':
      return { ...state, name: action.value };
    case 'email':
      return { ...state, email: action.value };
    case 'mobile':
      return { ...state, mobile: action.value };
    default:
      throw Error('uncatch action type');
  }
};

const useUser = (initialState: IUser) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const setUsername = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'username', value: evt.target.value });
    },
    [dispatch]
  );
  const setPassword = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'password', value: evt.target.value });
    },
    [dispatch]
  );
  const setName = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'name', value: evt.target.value });
    },
    [dispatch]
  );
  const setEmail = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'email', value: evt.target.value });
    },
    [dispatch]
  );
  const setMobile = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'mobile', value: evt.target.value });
    },
    [dispatch]
  );

  return {
    user: state,
    setUsername,
    setPassword,
    setName,
    setEmail,
    setMobile
  };
};
