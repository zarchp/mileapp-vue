<script setup lang="ts">
  import TaskCard from './TaskCard.vue';
  import type { Task } from '@/composables/useTasksQuery';

  const props = defineProps<{ tasks: Task[] }>();
  const emit = defineEmits<{
    (e: 'toggle', t: Task): void;
    (e: 'edit', t: Task): void;
    (e: 'delete', t: Task): void;
  }>();
</script>

<template>
  <div class="space-y-4">
    <TaskCard
      v-for="t in props.tasks"
      :key="t.id"
      :task="t"
      @toggle="emit('toggle', $event)"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />
    <p
      v-if="!props.tasks.length"
      class="text-center text-muted-foreground py-10"
    >
      No tasks match your filters.
    </p>
  </div>
</template>
