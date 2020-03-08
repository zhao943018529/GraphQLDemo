interface IBaseResponse {
  code: String;
  success: Boolean;
  message?: String;
}

export interface ITodo {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

export interface ITodoResponse extends IBaseResponse {
  todo: ITodo;
}
