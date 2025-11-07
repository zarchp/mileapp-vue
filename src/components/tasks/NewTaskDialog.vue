<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue';
  import { z } from 'zod';
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose,
  } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import Label from '@/components/ui/label/Label.vue';
  import { Textarea } from '@/components/ui/textarea';

  import type { DateValue } from '@internationalized/date';
  import {
    DateFormatter,
    getLocalTimeZone,
    parseDate,
  } from '@internationalized/date';
  import { Calendar as CalendarIcon, Plus } from 'lucide-vue-next';
  import { cn } from '@/lib/utils';
  import { Calendar } from '@/components/ui/calendar';
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from '@/components/ui/popover';

  const df = new DateFormatter('en-ID', { dateStyle: 'long' });

  const NewTaskSchema = z.object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required.')
      .max(255, 'Max 255 characters.'),
    description: z
      .string()
      .trim()
      .min(1, 'Description is required.')
      .max(2000, 'Max 2000 characters.'),
    due_date: z
      .any()
      .refine(
        (v) => v && typeof v === 'object' && 'toDate' in v,
        'Due date is required.'
      )
      .refine(
        (v) => {
          const d = v.toDate(getLocalTimeZone());
          const today = new Date();
          d.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          return d >= today;
        },
        { message: 'Due date cannot be in the past.' }
      ),
  });

  type NewTaskPayload = {
    title: string;
    description: string;
    due_date: DateValue;
  };

  const props = withDefaults(
    defineProps<{
      mode?: 'create' | 'edit';
      initialValues?: { title: string; description: string; due_date: string };
      id?: number;
      showTrigger?: boolean;
    }>(),
    {
      mode: 'create',
      showTrigger: true,
    }
  );

  const open = defineModel<boolean>('open', { default: false });

  const emit = defineEmits<{
    (
      e: 'create',
      payload: { title: string; description: string; due_date: string }
    ): void;
    (
      e: 'update',
      payload: {
        id: number;
        data: { title: string; description: string; due_date: string };
      }
    ): void;
  }>();

  const form = reactive<NewTaskPayload>({
    title: '',
    description: '',
    due_date: undefined as unknown as DateValue,
  });

  type FieldErrs = Partial<Record<keyof NewTaskPayload, string>>;
  const fieldErrors = ref<FieldErrs>({});

  function validateAll(): boolean {
    const res = NewTaskSchema.safeParse(form);
    fieldErrors.value = {};
    if (!res.success) {
      for (const issue of res.error.issues) {
        const key = issue.path[0] as keyof NewTaskPayload;
        if (!fieldErrors.value[key]) fieldErrors.value[key] = issue.message;
      }
    }
    return res.success;
  }

  function validateField<K extends keyof NewTaskPayload>(key: K) {
    const partial = NewTaskSchema.pick({ [key]: true } as Record<K, true>);
    const res = partial.safeParse({ [key]: form[key] } as Record<K, any>);
    if (!res.success)
      fieldErrors.value[key] = res.error.issues[0]?.message ?? 'Invalid value.';
    else delete fieldErrors.value[key];
  }

  const canSubmit = computed(() => {
    return (
      form.title.trim().length > 0 &&
      form.description.trim().length > 0 &&
      form.due_date &&
      Object.keys(fieldErrors.value).length === 0
    );
  });

  function reset() {
    form.title = '';
    form.description = '';
    form.due_date = undefined as any;
    fieldErrors.value = {};
  }

  watch(
    () => props.initialValues,
    (v) => {
      if (!v) return;
      form.title = v.title;
      form.description = v.description;
      form.due_date = parseDate(v.due_date);
      fieldErrors.value = {};
    },
    { immediate: true }
  );

  function toIsoDateString(dv: DateValue) {
    return dv.toDate(getLocalTimeZone()).toISOString().split('T')[0];
  }

  function onSubmit() {
    if (!validateAll()) return;

    const payload = {
      title: form.title,
      description: form.description,
      due_date: toIsoDateString(form.due_date),
    };

    if (props.mode === 'edit') {
      if (typeof props.id !== 'number') return;
      emit('update', { id: props.id, data: payload });
    } else {
      emit('create', payload);
    }

    reset();
    open.value = false;
  }

  const titleText = computed(() =>
    props.mode === 'edit' ? 'Edit Task' : 'New Task'
  );
  const descText = computed(() =>
    props.mode === 'edit'
      ? 'Update the details and save.'
      : 'Fill in the details and save.'
  );
  const submitText = computed(() =>
    props.mode === 'edit' ? 'Save' : 'Create'
  );
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger
      v-if="showTrigger"
      as-child
    >
      <Button class="cursor-pointer">
        <Plus />
        New Task
      </Button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ titleText }}</DialogTitle>
        <DialogDescription>{{ descText }}</DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-2">
        <div class="grid gap-2">
          <Label for="title">Title</Label>
          <Input
            id="title"
            v-model="form.title"
            placeholder="e.g. Design login page"
            @blur="validateField('title')"
          />
          <p
            v-if="fieldErrors.title"
            class="text-xs text-red-600"
          >
            {{ fieldErrors.title }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="form.description"
            rows="4"
            placeholder="Input description here..."
            @blur="validateField('description')"
          />
          <p
            v-if="fieldErrors.description"
            class="text-xs text-red-600"
          >
            {{ fieldErrors.description }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label>Due date</Label>
          <Popover class="w-full">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                :class="
                  cn(
                    'justify-start text-left font-normal cursor-pointer',
                    !form.due_date && 'text-muted-foreground'
                  )
                "
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{
                  form.due_date
                    ? df.format(form.due_date.toDate(getLocalTimeZone()))
                    : 'Pick a date'
                }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar
                v-model="form.due_date"
                initial-focus
                @update:modelValue="validateField('due_date')"
              />
            </PopoverContent>
          </Popover>
          <p
            v-if="fieldErrors.due_date"
            class="text-xs text-red-600"
          >
            {{ fieldErrors.due_date }}
          </p>
        </div>
      </div>

      <DialogFooter class="gap-2">
        <DialogClose as-child>
          <Button
            class="cursor-pointer"
            variant="outline"
            >Cancel</Button
          >
        </DialogClose>
        <Button
          class="cursor-pointer"
          :disabled="!canSubmit"
          @click="onSubmit"
        >
          {{ submitText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
