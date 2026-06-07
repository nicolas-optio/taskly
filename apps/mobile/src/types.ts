export type Priority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "done";

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  userId: number;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  imageUrl: string | null;
  categoryId: number | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  createdAt: string;
}

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}
