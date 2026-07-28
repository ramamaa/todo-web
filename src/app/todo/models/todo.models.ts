export type TodoPriority = 'low' | 'medium' | 'high';

export interface TodoItem {
  id: number;
  username?: string | null;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  priority: TodoPriority;
  created_at: string;
  updated_at?: string | null;
  category_id: number | null;
  category_name?: string | null;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  completed?: boolean;
  due_date?: string | null;
  priority?: TodoPriority;
  category_id?: number | null;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  due_date?: string | null;
  priority?: TodoPriority;
  category_id?: number | null;
}
