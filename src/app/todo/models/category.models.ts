export interface CategoryItem {
  id: number;
  name: string;
  user_id?: number;
  created_at?: string;
}

export interface CreateCategoryRequest {
  name: string;
}
