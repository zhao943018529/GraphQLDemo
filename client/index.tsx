import ApolloClient from 'apollo-boost';
import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import { InMemoryCache } from 'apollo-cache-inmemory';
// import Article from './Article';
import TodoApp from './TodoApp';
import D3Example from './routes/d3';
import { BrandIcon } from './controls/FontIcon';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import { LoginPage, SignUp } from './routes/login';

// 加载google roboto字体
import 'typeface-roboto';

// import style
import './style/index.scss';

import { ApolloProvider } from '@apollo/react-hooks';

const client = new ApolloClient({
  uri: 'http://localhost:3001/graphql',
  cache: new InMemoryCache()
});

const App = () => (
  <ApolloProvider client={client}>
    <div>
      <h2>My first Apollo app 🚀</h2>
      <BrandIcon iconName="zhihu" />
      <AccessAlarmIcon />
      <BrowserRouter>
        <div>
          <ul>
            <li>
              <Link to="/">TODOMVC</Link>
            </li>
            <li>
              <Link to="d3">D3 trainning</Link>
            </li>
            <li>
              <Link to="login">Login</Link>
            </li>
            <li>
              <Link to="signup">Sign up</Link>
            </li>
          </ul>
        </div>
        <Switch>
          <Route path="/d3">
            <D3Example />
          </Route>
          <Route path="/signup">
            <SignUp />
          </Route>
          <Route path="/login">
            <LoginPage />
          </Route>
          <Route path="/">
            <TodoApp />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  </ApolloProvider>
);

render(<App />, document.getElementById('root'));
