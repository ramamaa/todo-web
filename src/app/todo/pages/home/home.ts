import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AppHeader } from '../../../shared/components/app-header/app-header';
import { TodoItem } from '../../models/todo.models';
import { TodoService } from '../../services/todo';

@Component({
  selector: 'app-home',
  imports: [AppHeader, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly todoService = inject(TodoService);

  readonly todos = signal<TodoItem[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load todos. Please try again.');
        this.isLoading.set(false);
      },
    });
  }
}
