import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryItem, CreateCategoryRequest } from '../models/category.models';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = 'http://localhost:3000/categories';

  constructor(private readonly http: HttpClient) {}

  getMyCategories(): Observable<CategoryItem[]> {
    return this.http.get<CategoryItem[]>(`${this.apiUrl}/me`);
  }

  createCategory(data: CreateCategoryRequest): Observable<CategoryItem> {
    return this.http.post<CategoryItem>(this.apiUrl, data);
  }
}
