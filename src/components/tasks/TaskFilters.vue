```vue
<script setup lang="ts">
  import Label from '@/components/ui/label/Label.vue';
  import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
  import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  } from '@/components/ui/select';
  import type { TabVal, SortBy, SortDir } from '@/composables/useTasksQuery';
  import type { AcceptableValue } from 'reka-ui';

  const props = defineProps<{
    tab: TabVal;
    sortBy: SortBy;
    sortDir: SortDir;
    search: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:tab', v: TabVal): void;
    (e: 'update:sortBy', v: SortBy): void;
    (e: 'update:sortDir', v: SortDir): void;
    (e: 'search', v: string): void;
  }>();

  const tab = defineModel<'all' | 'active' | 'completed'>('tab', {
    default: 'all',
  });
  const isTab = (v: unknown): v is 'all' | 'active' | 'completed' =>
    v === 'all' || v === 'active' || v === 'completed';
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex flex-wrap justify-between items-center gap-3 rounded-lg border bg-card p-4"
    >
      <Tabs
        :modelValue="props.tab ?? 'all'"
        @update:modelValue="
          (v: AcceptableValue) => {
            if (isTab(v)) tab = v;
          }
        "
        class="flex justify-center items-center mx-auto md:mx-0"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div class="flex items-center gap-2">
        <Label for="sortBy">Sort by</Label>
        <Select
          :modelValue="props.sortBy"
          @update:modelValue="(v: any) => emit('update:sortBy', v)"
        >
          <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Created Date</SelectItem>
            <SelectItem value="updated_at">Updated Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="due_date">Due Date</SelectItem>
            <SelectItem value="completed_date">Completed Date</SelectItem>
          </SelectContent>
        </Select>

        <Select
          :modelValue="props.sortDir"
          @update:modelValue="(v: any) => emit('update:sortDir', v)"
        >
          <SelectTrigger><SelectValue placeholder="Direction" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
</template>
```
