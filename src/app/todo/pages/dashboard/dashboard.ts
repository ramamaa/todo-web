import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TodoItem } from '../../models/todo.models';
import { TodoService } from '../../services/todo';
import { AuthService } from '../../../auth/services/auth';
import { AppHeader } from '../../../shared/components/app-header/app-header';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, ReactiveFormsModule, AppHeader],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly todoService = inject(TodoService);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);

  readonly todos = signal<TodoItem[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly currentUser = this.authService.getCurrentUser();
  readonly actionErrorMessage = signal('');

  readonly isCreateFormOpen = signal(false);
  readonly isCreating = signal(false);
  readonly createErrorMessage = signal('');

  readonly createTodoForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required]],
    description: [''],
  });

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.todoService.getMyTodos().subscribe({
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

  openCreateForm(): void {
    this.createErrorMessage.set('');
    this.isCreateFormOpen.set(true);
  }

  closeCreateForm(): void {
    this.createTodoForm.reset();
    this.createErrorMessage.set('');
    this.isCreateFormOpen.set(false);
  }

  createTodo(): void {
    if (this.createTodoForm.invalid) {
      this.createTodoForm.markAllAsTouched();
      return;
    }

    this.isCreating.set(true);
    this.createErrorMessage.set('');

    this.todoService.createTodo(this.createTodoForm.getRawValue()).subscribe({
      next: () => {
        this.closeCreateForm();
        this.isCreating.set(false);
        this.loadTodos();
      },
      error: (error) => {
        this.createErrorMessage.set(error.error?.message ?? 'Could not create the todo.');
        this.isCreating.set(false);
      },
    });
  }
  isOwner(todo: TodoItem): boolean {
    return todo.userId === this.currentUser?.id;
  }

  toggleTodo(todo: TodoItem): void {
    this.actionErrorMessage.set('');

    this.todoService.updateTodo(todo.id, { completed: !todo.completed }).subscribe({
      next: (updatedTodo) => {
        this.todos.update((todos) =>
          todos.map((currentTodo) =>
            currentTodo.id === updatedTodo.id ? { ...currentTodo, ...updatedTodo } : currentTodo,
          ),
        );
      },
      error: (error) => {
        this.actionErrorMessage.set(error.error?.message ?? 'Could not update the todo.');
      },
    });
  }

  deleteTodo(todo: TodoItem): void {
    const shouldDelete = window.confirm(`Delete "${todo.title}"? This action cannot be undone.`);

    if (!shouldDelete) {
      return;
    }

    this.actionErrorMessage.set('');

    this.todoService.deleteTodo(todo.id).subscribe({
      next: () => {
        this.todos.update((todos) => todos.filter((currentTodo) => currentTodo.id !== todo.id));
      },
      error: (error) => {
        this.actionErrorMessage.set(error.error?.message ?? 'Could not delete the todo.');
      },
    });
  }
}
