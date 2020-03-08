const Koa = require("koa");
const { ApolloServer, gql } = require("apollo-server-koa");
const db = require("./db");
const Article = require("./model/Article");
const User = require("./model/User");
const Todo = require("./model/TodoItem");

const typeDefs = gql`
  type User {
    id: String
    name: String
    username: String
    password: String
    age: Int
    email: String
    role: Int
    mobile: String
  }

  type Article {
    id: String
    name: String
    content: String
    author: String
  }

  type Todo {
    id: String
    name: String
    description: String
    completed: Boolean
  }

  type Query {
    getArticles: [Article]
    todos: [Todo]
  }

  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type TodoMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    todo: Todo
  }

  type UserMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    user: User
  }

  input TodoInput {
    id: String!
    name: String
    completed: Boolean
  }

  input UserInput {
    name: String
    username: String!
    password: String!
    age: Int
    email: String
    mobile: String
  }

  type Mutation {
    addTodo(name: String!): TodoMutationResponse
    updateTodo(todo: TodoInput): TodoMutationResponse
    deleteTodo(id: String): TodoMutationResponse
    addUser(user: UserInput): UserMutationResponse
  }
`;

const resolvers = {
  Query: {
    todos: async () => {
      return await Todo.find().exec();
    },
    getArticles: async () => {
      const result = await Article.find().exec();
      return result;
    }
  },
  Mutation: {
    addTodo: async (parent, args) => {
      const todoIntance = new Todo({
        name: args.name
      });
      try {
        const todo = await todoIntance.save();
        return {
          code: 200,
          success: true,
          message: "successfully",
          todo
        };
      } catch (e) {
        return {
          code: 100,
          success: false,
          message: "failed"
        };
      }
    },
    updateTodo: async (parent, args) => {
      console.log(args);
      const input = args.todo;
      const id = input.id;
      delete input.id;
      try {
        const todo = await Todo.findOneAndUpdate({ _id: id }, input, {
          new: true
        }).exec();
        console.log(todo);
        return {
          code: 200,
          success: true,
          message: "successfully",
          todo
        };
      } catch (e) {
        return {
          code: 100,
          success: false,
          message: e.message,
          todo
        };
      }
    },
    deleteTodo: async (parent, args) => {
      try {
        const todo = await Todo.findOneAndDelete({ _id: args.id }).exec();

        return {
          code: 200,
          message: "delete successfully",
          success: true,
          todo
        };
      } catch (e) {
        return {
          code: 100,
          message: e.message,
          success: false
        };
      }
    },
    addUser: async (parent, args) => {
      try {
        const user = new User(args.user);
        const newUser = await user.save();
        return {
          code: 200,
          success: true,
          message: "successfully"
        };
      } catch (e) {
        return {
          code: 1,
          success: false,
          message: e.message
        };
      }
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });
const app = new Koa();
server.applyMiddleware({ app });

app.listen(3001, () => {
  console.log("server running port:3001");
});
