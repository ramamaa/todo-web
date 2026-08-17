import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppHeader } from '../../../shared/components/app-header/app-header';
import { AuthService } from '../../../auth/services/auth';
import { CategoryService } from '../../services/category.service';
import { TodoService } from '../../services/todo';
import { CategoryItem, CreateCategoryRequest } from '../../models/category.models';
import { TodoItem, TodoPriority } from '../../models/todo.models';
import { computed } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, AppHeader],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly todoService = inject(TodoService);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);

  readonly todos = signal<TodoItem[]>([]);
  readonly categories = signal<CategoryItem[]>([]);

  readonly isLoadingTodos = signal(true);
  readonly isLoadingCategories = signal(true);

  readonly todoErrorMessage = signal('');
  readonly categoryErrorMessage = signal('');
  readonly actionErrorMessage = signal('');

  readonly currentUser = this.authService.getCurrentUser();

  readonly isFormOpen = signal(false);
  readonly isSavingTodo = signal(false);
  readonly editingTodo = signal<TodoItem | null>(null);
  readonly todoFormError = signal('');

  readonly isCreatingCategory = signal(false);
  readonly categoryFormError = signal('');

  readonly createCategoryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  readonly todoForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required]],
    description: [''],
    priority: ['medium' as TodoPriority],
    due_date: [''],
    category_id: [''],
  });

  readonly completionPercentage = computed(() => {
    const items = this.todos();

    if (!items.length) {
      return 0;
    }

    const completed = items.filter((todo) => todo.completed).length;

    return Math.round((completed / items.length) * 100);
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadTodos();
  }

  loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.categoryErrorMessage.set('');

    this.categoryService.getMyCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoadingCategories.set(false);
      },
      error: () => {
        this.categoryErrorMessage.set('Could not load categories.');
        this.isLoadingCategories.set(false);
      },
    });
  }

  loadTodos(): void {
    this.isLoadingTodos.set(true);
    this.todoErrorMessage.set('');

    this.todoService.getMyTodos().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.isLoadingTodos.set(false);
      },
      error: () => {
        this.todoErrorMessage.set('Could not load todos. Please try again.');
        this.isLoadingTodos.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.editingTodo.set(null);
    this.todoFormError.set('');
    this.todoForm.reset({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      category_id: '',
    });
    this.isFormOpen.set(true);
  }

  openEditForm(todo: TodoItem): void {
    this.editingTodo.set(todo);
    this.todoFormError.set('');
    this.todoForm.reset({
      title: todo.title,
      description: todo.description ?? '',
      priority: todo.priority,
      due_date: todo.due_date ?? '',
      category_id: todo.category_id ? String(todo.category_id) : '',
    });
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingTodo.set(null);
    this.todoFormError.set('');
    this.todoForm.reset({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      category_id: '',
    });
  }

  saveTodo(): void {
    if (this.todoForm.invalid) {
      this.todoForm.markAllAsTouched();
      return;
    }

    const raw = this.todoForm.getRawValue();

    const payload = {
      title: raw.title,
      description: raw.description || undefined,
      priority: raw.priority as TodoPriority,
      due_date: raw.due_date || null,
      category_id: raw.category_id ? Number(raw.category_id) : null,
    };

    this.isSavingTodo.set(true);
    this.todoFormError.set('');

    const request$ = this.editingTodo()
      ? this.todoService.updateTodo(this.editingTodo()!.id, payload)
      : this.todoService.createTodo(payload);

    request$.subscribe({
      next: () => {
        this.closeForm();
        this.isSavingTodo.set(false);
        this.loadTodos();
      },
      error: (error) => {
        this.todoFormError.set(error.error?.message ?? 'Could not save todo.');
        this.isSavingTodo.set(false);
      },
    });
  }

  toggleTodo(todo: TodoItem): void {
    this.actionErrorMessage.set('');

    this.todoService
      .updateTodo(todo.id, {
        completed: !todo.completed,
      })
      .subscribe({
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

  createCategory(): void {
    if (this.createCategoryForm.invalid) {
      this.createCategoryForm.markAllAsTouched();
      return;
    }

    this.isCreatingCategory.set(true);
    this.categoryFormError.set('');

    const payload: CreateCategoryRequest = {
      name: this.createCategoryForm.getRawValue().name,
    };

    this.categoryService.createCategory(payload).subscribe({
      next: () => {
        this.createCategoryForm.reset({ name: '' });
        this.isCreatingCategory.set(false);
        this.loadCategories();
      },
      error: (error) => {
        this.categoryFormError.set(error.error?.message ?? 'Could not create category.');
        this.isCreatingCategory.set(false);
      },
    });
  }
}
