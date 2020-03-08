import * as React from 'react';
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Link } from 'react-router-dom';
const { useMemo } = React;

interface ListItemLinkProps extends React.Props<any> {
  icon: React.ReactElement;
  primary?: React.ReactNode;
  to: string;
}
export default function ListItemLink(props: ListItemLinkProps) {
  const { to, icon, primary } = props;
  const renderLink = useMemo(
    () =>
      // eslint-disable-next-line react/display-name
      React.forwardRef<React.ReactElement<any>, any>((linkProps, ref) => (
        <Link to={to} ref={ref} {...linkProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button component={renderLink}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}
