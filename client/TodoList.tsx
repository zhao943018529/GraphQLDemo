import * as React from "react";
import styled from "styled-components";

import TodoItem from "./TodoItem";
import { ITodo } from "./typings/Todo";

const ULContainer = styled.ul`
  background: #f4f4f4;
  padding: 0;
`;

interface ITodoListProps extends React.Props<any> {
  todos: ITodo[];
}

export default function TodoList(props: ITodoListProps) {
  return (
    <ULContainer>
      {props.todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ULContainer>
  );
}
