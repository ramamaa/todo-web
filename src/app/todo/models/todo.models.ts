export interface TodoOwner {
  id: number;
  username: string;
  email: string;
}

export interface TodoCategory {
  id: number;
  name: string;
}

export interface TodoItem {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  userId: number;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
  user?: TodoOwner;
  category?: TodoCategory | null;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}
