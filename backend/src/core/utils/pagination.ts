export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(query: Record<string, any>): PaginationParams {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function parseSort(query: Record<string, any>, allowedFields: string[]) {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  return { [sortBy]: sortOrder };
}

export function parseFilters(query: Record<string, any>, allowedFilters: string[]) {
  const filters: Record<string, any> = {};
  for (const key of allowedFilters) {
    if (query[key] !== undefined && query[key] !== '') {
      filters[key] = query[key];
    }
  }
  return filters;
}
