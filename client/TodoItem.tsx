import * as React from 'react';
const { useRef, useCallback, useEffect, useState } = React;
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import styled from 'styled-components';
import * as _ from 'lodash';
import { Input, CheckBox, BaseButton } from './BasicElement';
import { ITodo, ITodoResponse } from './typings/Todo';

const UPDATE_TODO = gql`
  mutation UpdateTodo($todo: TodoInput) {
    updateTodo(todo: $todo) {
      code
      success
      message
      todo {
        id
        name
        description
        completed
      }
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: String!) {
    deleteTodo(id: $id) {
      code
      success
      message
      todo {
        id
        name
        description
        completed
      }
    }
  }
`;

const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      name
      description
      completed
    }
  }
`;

const CheckBoxLabel = styled.label``;

const Button = styled(BaseButton)`
  padding: 4px;
`;

const LabelContainer = styled.div`
  padding: 4px;
  flex: 1;
  display: flex;
`;

const LabelContent = styled.label`
  flex: 1;
`;

const TextInput = styled(Input)`
  height: 100%;
  width: 100%;
`;

const TodoLi = styled.li<{ editing: boolean }>`
  border-bottom: 1px solid #c8c8c8;
  display: flex;
  align-items: center;
  & ${LabelContainer} {
    display: ${props => (props.editing ? 'none' : '')};
  }

  & ${TextInput} {
    display: ${props => (props.editing ? '' : 'none')};
  }
`;

// const TODOS_FRAGMENT = gql`
//   fragment deleteTodo on Todo {
//     id
//     name
//   }
// `;

interface PostTodo {
  id: string;
  name?: string;
  completed?: boolean;
}

interface TodoItemProps extends React.Props<any> {
  todo: ITodo;
}

export default function TodoItem(props: TodoItemProps) {
  const todo = props.todo;
  const [editing, setEditing] = useState<boolean>(false);
  const [value, setValue] = useState<string>(todo.name);
  const [updateTodo] = useMutation<
    { updateTodo: ITodoResponse },
    { todo: PostTodo }
  >(UPDATE_TODO);
  const [deleteTodo] = useMutation<
    { deleteTodo: ITodoResponse },
    { id: string }
  >(DELETE_TODO, {
    variables: { id: todo.id },
    update(caches, { data: { deleteTodo } }) {
      const { todos } = caches.readQuery({ query: GET_TODOS });
      todos.splice(_.findIndex(todos, { id: deleteTodo.todo.id }), 1);
      caches.writeQuery({ query: GET_TODOS, data: { todos } });
    }
  });
  const toggleCallback = useCallback(() => {
    setEditing(!editing);
  }, [editing, value]);
  const handleDel = useCallback(() => {
    deleteTodo();
  }, []);
  const inputRef = useRef<HTMLInputElement>();
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleBlur = useCallback(() => {
    const payload = { id: todo.id, name: value };
    updateTodo({ variables: { todo: payload } });
    setEditing(false);
  }, [todo, value]);

  const toggleComplete = useCallback(() => {
    const payload = { id: todo.id, completed: !todo.completed };
    updateTodo({ variables: { todo: payload } });
  }, [todo]);

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setValue(evt.target.value);
    },
    []
  );

  return (
    <TodoLi editing={editing}>
      <CheckBoxLabel>
        <CheckBox name={todo.id} onChange={toggleComplete} />
      </CheckBoxLabel>
      <LabelContainer>
        <LabelContent onDoubleClick={toggleCallback}>{todo.name}</LabelContent>
        <Button onClick={handleDel}>X</Button>
      </LabelContainer>
      <TextInput
        ref={inputRef}
        value={value}
        onBlur={handleBlur}
        onChange={handleChange}
      />
    </TodoLi>
  );
}
