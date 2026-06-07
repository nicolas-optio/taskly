import type { Task } from "./types";

// Tipagem das rotas do app
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  TaskForm: { task?: Task };
};
