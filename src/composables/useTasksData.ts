import { ref } from 'vue';
import type { Task } from '@/composables/useTasksQuery';

export type ApiTask = {
  id: number;
  title: string;
  description: string;
  due_date: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiPagination = {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
};

export type ApiResponse = {
  data: ApiTask[];
  meta: ApiPagination;
};

export function mapApiTask(t: ApiTask): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    due_date: t.due_date,
    isCompleted: t.is_completed,
    completed_date: t.completed_at,
    created_at: t.created_at,
    updated_at: t.updated_at,
  };
}

export function useTasksData() {
  const tasksRaw = ref<ApiTask[]>([]);
  const tasks = ref<Task[]>([]);
  const meta = ref<ApiPagination | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchTasks(params?: {
    page?: number;
    per_page?: number;
    q?: string;
    tab?: 'all' | 'active' | 'completed';
    sortBy?:
      | 'created_at'
      | 'updated_at'
      | 'title'
      | 'due_date'
      | 'completed_date';
    sortDir?: 'asc' | 'desc';
  }) {
    loading.value = true;
    error.value = null;

    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? 'http://api.test';
      const token = localStorage.getItem('access_token');

      const url = new URL(`${base}/tasks`);
      if (params?.page) url.searchParams.set('page', String(params.page));
      if (params?.per_page)
        url.searchParams.set('per_page', String(params.per_page));
      if (params?.q) url.searchParams.set('q', params.q);
      if (params?.tab && params.tab !== 'all')
        url.searchParams.set('tab', params.tab);
      if (params?.sortBy) url.searchParams.set('sortBy', params.sortBy);
      if (params?.sortDir) url.searchParams.set('sortDir', params.sortDir);

      const res = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }

      const body = (await res.json()) as ApiResponse;

      tasksRaw.value = body.data;
      tasks.value = body.data.map(mapApiTask);
      meta.value = body.meta;
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load tasks';
    } finally {
      loading.value = false;
    }
  }

  return { tasks, tasksRaw, meta, loading, error, fetchTasks };
}
