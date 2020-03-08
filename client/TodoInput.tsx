import * as React from 'react';
const useState = React.useState;
const useCallback = React.useCallback;
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';

import { ITodo, ITodoResponse } from './typings/Todo';
import { Input } from './BasicElement';

const ADD_TODO = gql`
  mutation AddTodo($name: String!) {
    addTodo(name: $name) {
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

// type Todo {
//     id: String
//     name: String
//     descriptions: String
//     completed: Boolean
// }

// interface MutationResponse {
//     code: String!
//     success: Boolean!
//     message: String!
// }

// type TodoMutationResponse implements MutationResponse {
//     code: String!
//     success: Boolean!
//     message: String!
//     todo: {
//         id: String
//         name: String
//         descriptions: String
//         completed: Boolean
//     }
// }

export default function TodoInput(props: any) {
  const [name, setName] = useState<string>('');
  const [addTodo, { error, data }] = useMutation<
    { addTodo: ITodoResponse },
    { name: string }
  >(ADD_TODO, {
    update(caches, { data: { addTodo } }) {
      const { todos } = caches.readQuery({ query: GET_TODOS });
      caches.writeQuery({
        query: GET_TODOS,
        data: { todos: todos.concat(addTodo.todo) }
      });
    }
  });
  const handleAdd = useCallback(
    (evt: React.KeyboardEvent<HTMLInputElement>) => {
      if (evt.keyCode === 13) {
        const value = name.trim();
        if (value) {
          addTodo({ variables: { name: value } });
          setName('');
        }
      }
    },
    [name]
  );

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setName(evt.currentTarget.value);
    },
    []
  );

  if (error) return <p>{error.message}</p>;
  return (
    <div>
      <Input
        type="text"
        value={name}
        onKeyDown={handleAdd}
        onChange={handleChange}
      />
    </div>
  );
}
