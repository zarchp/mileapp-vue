import { ref, computed, type Ref } from 'vue';
import { useRoute, useRouter, type Router } from 'vue-router';
import debounce from 'lodash.debounce';

export type Task = {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  due_date: string; 
  completed_date?: string | null;
  created_at: string;
  updated_at: string;
};

export type TabVal = 'all' | 'active' | 'completed';
export type SortBy =
  | 'created_at'
  | 'updated_at'
  | 'title'
  | 'due_date'
  | 'completed_date';
export type SortDir = 'asc' | 'desc';

export function useTasksQuery(tasks: Ref<Task[]>) {
  const router: Router = useRouter();
  const route = useRoute();

  const tab = ref<TabVal>((route.query.tab as TabVal) ?? 'all');
  const search = ref<string>((route.query.q as string) ?? '');
  const sortBy = ref<SortBy>(
    ((route.query.sortBy as string) ?? 'created_at') as SortBy
  );
  const sortDir = ref<SortDir>(
    ((route.query.sortDir as string) ?? 'desc') as SortDir
  );

  const syncQuery = debounce(() => {
    router.replace({
      query: {
        tab: tab.value !== 'all' ? tab.value : undefined,
        q: search.value || undefined,
        sortBy: sortBy.value !== 'created_at' ? sortBy.value : undefined,
        sortDir: sortDir.value !== 'desc' ? sortDir.value : undefined,
      },
    });
  }, 200);

  function setTab(v: TabVal) {
    tab.value = v;
    syncQuery();
  }
  function onSearchInput(value: string) {
    search.value = value;
    syncQuery();
  }
  function setSortBy(v: SortBy) {
    sortBy.value = v;
    syncQuery();
  }
  function setSortDir(v: SortDir) {
    sortDir.value = v;
    syncQuery();
  }

  const visibleTasks = computed(() => {
    let list = tasks.value;
    if (tab.value === 'active') list = list.filter((t) => !t.isCompleted);
    if (tab.value === 'completed') list = list.filter((t) => t.isCompleted);

    const q = search.value.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    const dir = sortDir.value === 'asc' ? 1 : -1;
    const key = sortBy.value as keyof Task;
    return [...list].sort((a, b) => {
      const va = (a as any)[key] ?? '';
      const vb = (b as any)[key] ?? '';
      if (va === vb) return 0;
      return va > vb ? dir : -dir;
    });
  });

  return {
    tab,
    search,
    sortBy,
    sortDir,
    setTab,
    onSearchInput,
    setSortBy,
    setSortDir,
    visibleTasks,
  };
}
