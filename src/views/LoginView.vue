<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { loginSchema, type LoginForm } from '@/schemas/login';
  import Card from '@/components/ui/card/Card.vue';
  import CardHeader from '@/components/ui/card/CardHeader.vue';
  import CardTitle from '@/components/ui/card/CardTitle.vue';
  import CardDescription from '@/components/ui/card/CardDescription.vue';
  import CardContent from '@/components/ui/card/CardContent.vue';
  import CardFooter from '@/components/ui/card/CardFooter.vue';
  import { CheckSquare } from 'lucide-vue-next';
  import Label from '@/components/ui/label/Label.vue';
  import Input from '@/components/ui/input/Input.vue';
  import Button from '@/components/ui/button/Button.vue';
  import router from '@/router';

  const form = reactive<LoginForm>({ email: '', password: '' });
  const errors = reactive<Record<string, string>>({});
  const serverError = ref<string | null>(null);
  const isLoading = ref(false);

  function validate() {
    Object.keys(errors).forEach((k) => delete errors[k]);

    const response = loginSchema.safeParse(form);
    if (!response.success) {
      for (const issue of response.error.issues) {
        const key = issue.path.join('.') || 'form';
        errors[key] = issue.message;
      }
    }
    return response.success;
  }

  async function onSubmit() {
    serverError.value = null;
    if (!validate()) return;

    isLoading.value = true;

    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? '';
      const response = await fetch(`${base}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message ?? `HTTP ${response.status}`);
      }

      const body = await response.json();
      localStorage.setItem('access_token', body.access_token);

      router.push('/tasks');
    } catch (e: any) {
      serverError.value = e?.message ?? 'Login failed';
    } finally {
      isLoading.value = false;
    }
  }
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-muted/30 px-4 w-full"
  >
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1 text-center">
        <div class="flex justify-center mb-4">
          <div class="flex items-center gap-2">
            <CheckSquare class="size-8 text-emerald-500" />
            <span class="text-2xl font-bold">CodeTask</span>
          </div>
        </div>
        <CardTitle class="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Enter your credentials to access your tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          class="space-y-4"
          @submit.prevent="onSubmit"
          novalidate
        >
          <div class="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              v-model.trim="form.email"
              type="email"
              placeholder="fullstack@test.com"
              autocomplete="username"
              class="input"
              :aria-invalid="!!errors.email"
              required
            />
            <p
              v-if="errors.email"
              class="text-sm text-destructive"
            >
              {{ errors.email }}
            </p>
          </div>
          <div class="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              class="input"
              :aria-invalid="!!errors.password"
              required
            />
            <p
              v-if="errors.password"
              class="text-sm text-destructive"
            >
              {{ errors.password }}
            </p>
          </div>
          <Button
            type="submit"
            class="w-full cursor-pointer"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">Login</span>
            <span v-else>Signing in…</span>
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p class="text-center text-sm text-muted-foreground w-full">
          Demo credentials: any email and password combination
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped>
  /*  */
</style>
