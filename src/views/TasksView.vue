<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { Button } from '@/components/ui/button';
  import TaskFilters from '@/components/tasks/TaskFilters.vue';
  import TaskList from '@/components/tasks/TaskList.vue';
  import { useTasksQuery, type Task } from '@/composables/useTasksQuery';
  import NewTaskDialog from '@/components/tasks/NewTaskDialog.vue';
  import { useTasksData } from '@/composables/useTasksData';
  import Select from '@/components/ui/select/Select.vue';
  import SelectTrigger from '@/components/ui/select/SelectTrigger.vue';
  import SelectValue from '@/components/ui/select/SelectValue.vue';
  import SelectContent from '@/components/ui/select/SelectContent.vue';
  import SelectItem from '@/components/ui/select/SelectItem.vue';
  import {
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    LogOut,
  } from 'lucide-vue-next';
  import type { AcceptableValue } from 'reka-ui';
  import router from '@/router';

  const { tasks, meta, loading, error, fetchTasks } = useTasksData();

  const {
    tab,
    search,
    sortBy,
    sortDir,
    setTab,
    onSearchInput,
    setSortBy,
    setSortDir,
    visibleTasks,
  } = useTasksQuery(tasks);

  const currentPage = ref(1);
  const perPage = ref(5);

  onMounted(() =>
    fetchTasks({
      page: currentPage.value,
      per_page: perPage.value,
      sort_by: sortBy.value,
      sort_order: sortDir.value,
    })
  );

  console.log({
    page: currentPage.value,
    per_page: perPage.value,
    sort_by: sortBy.value,
    sort_order: sortDir.value,
  });

  watch([tab, search, sortBy, sortDir, currentPage, perPage], () => {
    fetchTasks({
      page: currentPage.value,
      per_page: perPage.value,
      q: search.value || undefined,
      tab: tab.value,
      sort_by: sortBy.value,
      sort_order: sortDir.value,
    });
  });

  const total = computed(() => meta.value?.total ?? tasks.value.length);
  const pageCount = computed(() => meta.value?.last_page ?? 1);
  const from = computed(
    () => meta.value?.from ?? (currentPage.value - 1) * perPage.value + 1
  );
  const to = computed(
    () =>
      meta.value?.to ?? Math.min(currentPage.value * perPage.value, total.value)
  );

  function goToPage(p: number) {
    if (p < 1 || p > pageCount.value) return;
    currentPage.value = p;
  }
  function nextPage() {
    goToPage(currentPage.value + 1);
  }
  function prevPage() {
    goToPage(currentPage.value - 1);
  }
  function changePerPage(v: string) {
    perPage.value = Number(v) || 10;
    currentPage.value = 1;
  }

  const pageNumbers = computed(() => {
    const last = pageCount.value;
    const cur = currentPage.value;
    const pages = new Set<number>(
      [1, last, cur - 2, cur - 1, cur, cur + 1, cur + 2].filter(
        (p) => p >= 1 && p <= last
      )
    );
    return [...pages].sort((a, b) => a - b);
  });

  async function handleCreate(payload: {
    title: string;
    description: string;
    due_date: string;
  }) {
    const nowIso = new Date().toISOString();
    const nextId = (tasks.value.at(-1)?.id ?? 0) + 1;
    tasks.value.push({
      id: nextId,
      title: payload.title,
      description: payload.description,
      isCompleted: false,
      due_date: payload.due_date,
      completed_date: null,
      created_at: nowIso,
      updated_at: nowIso,
    });

    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? '';
      const response = await fetch(`${base}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? `HTTP ${response.status}`);
      }

      const data = await response.json();

      const idx = tasks.value.findIndex((t) => t.id === nextId);
      if (idx !== -1 && data?.id) {
        tasks.value[idx].id = data.id;
        tasks.value[idx].created_at = data.created_at ?? nowIso;
        tasks.value[idx].updated_at = data.updated_at ?? nowIso;
      }
    } catch (error: any) {
      const idx = tasks.value.findIndex((t) => t.id === nextId);
      if (idx !== -1) tasks.value.splice(idx, 1);
      alert(error.message ?? 'Failed to create task');
    }
  }

  function toggleComplete(task: Task) {
    const nowIso = new Date().toISOString();
    if (task.isCompleted) {
      task.isCompleted = false;
      task.completed_date = null;
    } else {
      task.isCompleted = true;
      task.completed_date = nowIso;
    }
    task.updated_at = nowIso;
  }

  const isEditOpen = ref(false);
  const editingTask = ref<Task | null>(null);

  function onEdit(t: Task) {
    editingTask.value = { ...t };
    isEditOpen.value = true;
  }

  async function submitEdit(
    id: number,
    data: { title: string; description: string; due_date: string }
  ) {
    const idx = tasks.value.findIndex((x) => x.id === id);
    if (idx === -1) return;
    const prev = { ...tasks.value[idx] };
    const nowIso = new Date().toISOString();

    tasks.value[idx] = {
      ...tasks.value[idx],
      title: data.title,
      description: data.description,
      due_date: data.due_date,
      updated_at: nowIso,
    };

    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? '';
      const res = await fetch(`${base}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message ?? `HTTP ${res.status}`);
      }
      const j = await res.json().catch(() => null);
      tasks.value[idx].updated_at = j?.updated_at ?? nowIso;
    } catch (e: any) {
      tasks.value[idx] = prev;
      alert(e?.message ?? 'Failed to update task');
    } finally {
      isEditOpen.value = false;
      editingTask.value = null;
    }
  }

  const isDeleting = ref(false);

  async function onDelete(task: Task) {
    if (!confirm(`Delete task "${task.title}"?`)) return;

    isDeleting.value = true;
    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? '';
      const response = await fetch(`${base}/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? `HTTP ${response.status}`);
      }

      const index = tasks.value.findIndex((t) => t.id === task.id);
      if (index !== -1) tasks.value.splice(index, 1);
    } catch (error: any) {
      console.error(error);
      alert(error.message ?? 'Failed to delete task');
    } finally {
      isDeleting.value = false;
    }
  }

  function handleSignOut() {
    localStorage.removeItem('access_token');
    router.push('/login');
  }
</script>

<template>
  <section class="max-w-5xl mx-auto p-6 space-y-6">
    <header class="flex items-center justify-between gap-4">
      <div>
        <div class="text-2xl font-semibold flex items-center gap-2 mb-1">
          <CheckSquare class="size-8 text-emerald-500" />
          CodeTask
        </div>
        <p class="text-sm text-muted-foreground">
          Manage and track your tasks efficiently
        </p>
      </div>

      <div class="flex gap-4">
        <Button
          variant="outline"
          class="cursor-pointer"
          @click="handleSignOut"
        >
          <LogOut />
          Sign Out
        </Button>

        <NewTaskDialog @create="handleCreate" />

        <NewTaskDialog
          v-if="editingTask"
          v-model:open="isEditOpen"
          mode="edit"
          :id="editingTask.id"
          :initial-values="{
            title: editingTask.title,
            description: editingTask.description,
            due_date: editingTask.due_date,
          }"
          :show-trigger="false"
          @update="({ id, data }) => submitEdit(id, data)"
        />
      </div>
    </header>

    <TaskFilters
      :tab="tab"
      :sortBy="sortBy"
      :sortDir="sortDir"
      :search="search"
      @update:tab="setTab"
      @update:sortBy="setSortBy"
      @update:sortDir="setSortDir"
      @search="onSearchInput"
    />

    <TaskList
      :tasks="visibleTasks"
      @toggle="toggleComplete"
      @edit="onEdit"
      @delete="onDelete"
    />

    <div
      class="flex flex-wrap md:flex-row flex-col items-center justify-between gap-3 border-t pt-4 gap-4"
    >
      <div class="flex items-center gap-4 md:flex-row">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">Per page</span>
          <Select
            :modelValue="String(perPage)"
            @update:modelValue="
              (value: AcceptableValue) => changePerPage(String(value))
            "
          >
            <SelectTrigger class="w-[84px]">
              <SelectValue :placeholder="String(perPage)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="text-sm text-muted-foreground">
          Showing
          <span class="font-medium">{{ from }} </span>
          -
          <span class="font-medium">{{ to }} </span>
          of
          <span class="font-medium">{{ total }}</span>
        </div>
      </div>

      <!-- Right: controls -->
      <div class="flex items-center gap-2">
        <!-- Prev -->
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <ChevronLeft />
          Prev
        </Button>

        <!-- Page numbers with ellipses -->
        <template
          v-for="(p, idx) in pageNumbers"
          :key="p"
        >
          <span
            v-if="idx > 0 && pageNumbers[idx - 1] !== p - 1"
            class="px-1 text-muted-foreground"
            >…</span
          >
          <Button
            variant="outline"
            size="sm"
            :class="
              p === currentPage
                ? 'bg-primary text-primary-foreground hover:bg-primary'
                : ''
            "
            @click="goToPage(p)"
          >
            {{ p }}
          </Button>
        </template>

        <!-- Next -->
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === pageCount"
          @click="nextPage"
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  </section>
</template>
