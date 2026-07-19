import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTodoRequest, TodoItem, UpdateTodoRequest } from '../models/todo.models';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly apiUrl = 'http://localhost:3000/todos';

  constructor(private readonly http: HttpClient) {}

  getTodos(): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(this.apiUrl);
  }

  getMyTodos(): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(`${this.apiUrl}/me`);
  }

  createTodo(data: CreateTodoRequest): Observable<TodoItem> {
    return this.http.post<TodoItem>(this.apiUrl, data);
  }

  updateTodo(id: number, data: UpdateTodoRequest): Observable<TodoItem> {
    return this.http.patch<TodoItem>(`${this.apiUrl}/${id}`, data);
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
