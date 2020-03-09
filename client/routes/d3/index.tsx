import * as React from 'react';
import styled from 'styled-components';
import { List } from '@material-ui/core';
import { Drafts } from '@material-ui/icons';
import ListItemLink from './ListItemLink';
import { Switch, BrowserRouter, Route, useRouteMatch } from 'react-router-dom';
import D3Shape from './D3Shape';
import BarChart from './BarChart';
import LineChart from './LineChart';
import ForceChart from './ForceChart';
import ForceChart2 from './ForceChart2';

const Div = styled.div``;

export default function palyground() {
  const { path, url } = useRouteMatch();

  return (
    <Div>
      <BrowserRouter>
        <List component="ul">
          <ListItemLink icon={<Drafts />} to={`${path}`}></ListItemLink>
          <ListItemLink icon={<Drafts />} to={`${path}/bar`}></ListItemLink>
          <ListItemLink icon={<Drafts />} to={`${path}/line`}>
            Line Chart
          </ListItemLink>
          <ListItemLink icon={<Drafts />} to={`${path}/force`}></ListItemLink>
          <ListItemLink icon={<Drafts />} to={`${path}/force2`}></ListItemLink>
        </List>
        <Switch>
          <Route path={path} exact={true}>
            <D3Shape />
          </Route>
          <Route path={`${path}/bar`}>
            <BarChart />
          </Route>
          <Route path={`${path}/line`}>
            <LineChart />
          </Route>
          <Route path={`${path}/force`}>
            <ForceChart />
          </Route>
          <Route path={`${path}/force2`}>
            <ForceChart2 />
          </Route>
        </Switch>
      </BrowserRouter>
    </Div>
  );
}
