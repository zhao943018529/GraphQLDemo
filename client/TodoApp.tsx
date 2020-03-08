import * as React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import styled from 'styled-components';
import { ITodo } from './typings/Todo';
import TodoList from './TodoList';
import TodoInput from './TodoInput';

const TodoContainer = styled.section`
  width: 400px;
  margin: auto;
`;

export const GET_TODOS = gql`
  {
    todos {
      id
      name
      description
      completed
    }
  }
`;

interface QueryTodosProps {
  todos: ITodo[];
}

export default function TodoApp() {
  const { loading, data } = useQuery<QueryTodosProps>(GET_TODOS);
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <TodoContainer>
      <header>
        <TodoInput />
      </header>
      <main>
        <TodoList todos={data.todos} />
      </main>
    </TodoContainer>
  );
}
