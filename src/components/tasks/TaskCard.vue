<script setup lang="ts">
  import { Card, CardHeader, CardTitle } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
  import {
    Calendar,
    Square,
    SquareCheckBig,
    Pencil,
    Trash2,
    Ellipsis,
  } from 'lucide-vue-next';
  import type { Task } from '@/composables/useTasksQuery';
  import { fmtExact, humanDue, humanCompleted, dueBgClass } from '@/utils/date';

  const props = defineProps<{ task: Task }>();
  const emit = defineEmits<{
    (e: 'toggle', t: Task): void;
    (e: 'edit', t: Task): void;
    (e: 'delete', t: Task): void;
  }>();

  function handleDelete() {
    emit('delete', props.task);
  }

  function cardBgClass(t: Task): string {
    return t.isCompleted ? 'bg-green-50/40' : dueBgClass(t.due_date);
  }
</script>

<template>
  <Card
    class="overflow-hidden transition-colors"
    :class="cardBgClass(task)"
  >
    <CardHeader class="flex flex-row items-center justify-between gap-4">
      <div class="flex flex-col gap-2">
        <CardTitle class="text-base">
          <span
            :class="
              task.isCompleted ? 'line-through text-muted-foreground' : ''
            "
            >{{ task.title }}</span
          >
        </CardTitle>
        <p class="text-sm text-muted-foreground">{{ task.description }}</p>

        <div class="flex items-center gap-3">
          <span
            v-if="!task.isCompleted"
            class="inline-flex items-center gap-1 text-xs text-muted-foreground"
            :title="fmtExact(task.due_date)"
          >
            <Calendar class="h-3.5 w-3.5" />
            Due: {{ humanDue(task.due_date) }}
          </span>
          <span
            v-if="task.isCompleted && task.completed_date"
            class="inline-flex items-center gap-1 text-xs text-green-700"
            :title="fmtExact(task.completed_date)"
          >
            <Calendar class="h-3.5 w-3.5" />
            Completed: {{ humanCompleted(task.completed_date) }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          class="group hover:bg-green-50 cursor-pointer"
          :aria-label="task.isCompleted ? 'Reopen task' : 'Mark complete'"
          @click="emit('toggle', task)"
          :title="task.isCompleted ? 'Reopen' : 'Complete'"
        >
          <template v-if="!task.isCompleted">
            <Square class="size-6 text-muted-foreground group-hover:hidden" />
            <SquareCheckBig
              class="hidden size-6 text-green-600 group-hover:block"
            />
          </template>
          <template v-else>
            <SquareCheckBig
              class="size-6 text-green-600 cursor-default pointer-events-none"
            />
          </template>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="size-8 cursor-pointer"
              :aria-label="`Actions for ${task.title}`"
              @click.stop
            >
              <Ellipsis class="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            class="w-44"
            @click.stop
          >
            <DropdownMenuItem
              class="cursor-pointer"
              @select="emit('edit', task)"
            >
              <Pencil /> Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              class="text-red-600 focus:text-red-700 cursor-pointer"
              @click="emit('delete', task)"
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
  </Card>
</template>
