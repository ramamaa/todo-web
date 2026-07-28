import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppHeader } from '../../../shared/components/app-header/app-header';
import { TodoItem } from '../../models/todo.models';
import { TodoService } from '../../services/todo';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AppHeader, DatePipe, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly todoService = inject(TodoService);

  readonly todos = signal<TodoItem[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly selectedCategory = signal<string>('all');

  readonly categories = computed(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();

    for (const todo of this.todos()) {
      const rawName = todo.category_name?.trim() ?? '';
      const key = rawName ? rawName.toLowerCase() : 'none';
      const displayName = rawName
        ? rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()
        : 'No category';

      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {
          id: key,
          name: displayName,
          count: 1,
        });
      }
    }

    return [
      { id: 'all', name: 'All', count: this.todos().length },
      ...Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)),
    ];
  });

  readonly filteredTodos = computed(() => {
    const selected = this.selectedCategory();

    if (selected === 'all') {
      return this.todos();
    }

    if (selected === 'none') {
      return this.todos().filter((todo) => !todo.category_name?.trim());
    }

    return this.todos().filter((todo) => todo.category_name?.trim().toLowerCase() === selected);
  });

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.todoService.getPublicTodos().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load public todos.');
        this.isLoading.set(false);
      },
    });
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
  }
}
