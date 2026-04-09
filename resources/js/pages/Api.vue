<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import axios from 'axios';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { index as booksIndexRoute, store as booksStoreRoute } from '@/routes/books/api';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
}

interface Book {
    id: number;
    user_id: number;
    title: string;
    image: string;
    description: string;
    author: string;
    publication_year: number;
    created_at: string;
    user?: User;
}

const props = defineProps<{
    authUser: User | null;
}>();

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'API',
        href: '/api',
    },
];

const books = ref<Book[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const meta = reactive({
    total: 0,
    limit: 20,
    cached: false,
});

const filters = reactive({
    mine: false,
    q: '',
    author: '',
    publication_year: '' as string | number,
    sort: 'created_at' as 'created_at' | 'title' | 'author' | 'publication_year',
    direction: 'desc' as 'asc' | 'desc',
    limit: 20 as number,
});

const filterParams = computed<Record<string, string | number | boolean | null>>(() => {
    const publicationYearValue = (() => {
        if (filters.publication_year === '' || filters.publication_year === null) {
            return null;
        }

        const yearNumber = Number(filters.publication_year);
        if (!Number.isFinite(yearNumber)) {
            return null;
        }

        return yearNumber;
    })();

    const params: Record<string, string | number | boolean | null> = {
        mine: filters.mine,
        q: filters.q.trim() ? filters.q.trim() : null,
        author: filters.author.trim() ? filters.author.trim() : null,
        publication_year: publicationYearValue,
        sort: filters.sort,
        direction: filters.direction,
        limit: filters.limit,
    };

    // Remove nulls so Laravel doesn’t validate them as strings.
    Object.keys(params).forEach((key) => {
        if (params[key] === null) {
            delete params[key];
        }
    });

    return params;
});

const fetchBooks = async (): Promise<void> => {
    if (loading.value) {
        return;
    }

    loading.value = true;
    errorMessage.value = null;

    if (filters.publication_year !== '') {
        const yearNumber = Number(filters.publication_year);
        if (!Number.isFinite(yearNumber)) {
            errorMessage.value = 'Publication year must be a valid number.';
            loading.value = false;
            return;
        }
    }

    try {
        const response = await axios.get(booksIndexRoute.url(), {
            params: filterParams.value,
        });

        books.value = (response.data.data ?? []) as Book[];
        meta.total = Number(response.data.meta?.total ?? 0);
        meta.limit = Number(response.data.meta?.limit ?? 20);
        meta.cached = Boolean(response.data.meta?.cached ?? false);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const data = error.response?.data as any;
            const serverMessage =
                (typeof data?.error === 'string' && data.error.trim()) ||
                (typeof data?.message === 'string' && data.message.trim()) ||
                null;

            if (status === 401 || status === 403) {
                errorMessage.value = 'Please sign in to load books.';
            } else if (typeof status === 'number') {
                errorMessage.value = `Failed to load books (HTTP ${status}).${serverMessage ? ` ${serverMessage}` : ''}`;
            } else {
                errorMessage.value = 'Failed to load books (network error).';
            }
        } else {
            errorMessage.value = 'Failed to load books.';
        }

        // Keep console details for debugging.
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const bookImagePlaceholder = computed(() => {
    // Use a deterministic placeholder so layout is stable.
    return 'https://placehold.co/600x380?text=No+Image';
});

const isMine = (book: Book): boolean => {
    if (!props.authUser) {
        return false;
    }

    return Number(props.authUser.id) === Number(book.user_id);
};

const createForm = reactive({
    title: '',
    imageFile: null as File | null,
    description: '',
    author: '',
    publication_year: new Date().getFullYear() as number,
});

const createImagePreviewUrl = ref(bookImagePlaceholder.value);
const imageObjectUrl = ref<string | null>(null);

const setCreateImageFile = (file: File | null): void => {
    if (imageObjectUrl.value) {
        URL.revokeObjectURL(imageObjectUrl.value);
        imageObjectUrl.value = null;
    }

    createForm.imageFile = file;

    if (!file) {
        createImagePreviewUrl.value = bookImagePlaceholder.value;
        return;
    }

    imageObjectUrl.value = URL.createObjectURL(file);
    createImagePreviewUrl.value = imageObjectUrl.value;
};

const handleCreateImageChange = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    setCreateImageFile(file);
};

onBeforeUnmount(() => {
    if (imageObjectUrl.value) {
        URL.revokeObjectURL(imageObjectUrl.value);
        imageObjectUrl.value = null;
    }
});

const createSubmitting = ref(false);
const createErrorMessage = ref<string | null>(null);
const createErrors = reactive<Record<string, string>>({});

const resetCreateErrors = (): void => {
    createErrorMessage.value = null;
    Object.keys(createErrors).forEach((key) => {
        delete createErrors[key];
    });
};

const submitCreate = async (): Promise<void> => {
    createSubmitting.value = true;
    resetCreateErrors();

    try {
        const formData = new FormData();
        formData.append('title', createForm.title);
        formData.append('author', createForm.author);
        formData.append('description', createForm.description);
        formData.append('publication_year', String(createForm.publication_year));

        if (createForm.imageFile) {
            formData.append('image', createForm.imageFile);
        }

        await axios.post(booksStoreRoute.url(), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Keep current filter, but reload the list so it reflects the newly created item.
        createForm.title = '';
        setCreateImageFile(null);
        createForm.description = '';
        createForm.author = '';
        createForm.publication_year = new Date().getFullYear();

        await fetchBooks();
    } catch (error: any) {
        console.error(error);
        if (error?.response?.status === 422 && error?.response?.data?.errors) {
            const serverErrors = error.response.data.errors as Record<string, string[]>;
            Object.keys(serverErrors).forEach((key) => {
                createErrors[key] = serverErrors[key]?.[0] ?? 'Invalid value.';
            });
            createErrorMessage.value = 'Please fix the highlighted fields.';
        } else {
            createErrorMessage.value = 'Failed to create the book.';
        }
    } finally {
        createSubmitting.value = false;
    }
};

onMounted(() => {
    void fetchBooks();
});
</script>

<template>
    <Head title="API - Books" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-3 p-3">
            <!-- Create + Filters (collapsed for compactness) -->
            <section class="grid gap-3">
                <details class="rounded-xl border border-zinc-200 bg-white p-0 dark:border-zinc-800 dark:bg-zinc-950">
                    <summary class="cursor-pointer px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-white">
                        Create book
                    </summary>

                    <div class="p-3 pt-0">
                        <form class="space-y-2" @submit.prevent="submitCreate()">
                            <div>
                                <input
                                    v-model="createForm.title"
                                    type="text"
                                    placeholder="Title"
                                    class="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                                />
                                <p v-if="createErrors.title" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ createErrors.title }}</p>
                            </div>

                            <div>
                                <input
                                    v-model="createForm.author"
                                    type="text"
                                    placeholder="Author"
                                    class="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                                />
                                <p v-if="createErrors.author" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ createErrors.author }}</p>
                            </div>

                            <div>
                                <input
                                    v-model.number="createForm.publication_year"
                                    type="number"
                                    placeholder="Publication year"
                                    class="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                                />
                                <p v-if="createErrors.publication_year" class="mt-1 text-xs text-red-600 dark:text-red-400">
                                    {{ createErrors.publication_year }}
                                </p>
                            </div>

                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    class="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                                    @change="handleCreateImageChange"
                                />
                                <p v-if="createErrors.image" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ createErrors.image }}</p>

                                <div class="mt-2 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                                    <img
                                        :src="createImagePreviewUrl"
                                        alt="Image preview"
                                        class="h-24 w-full object-cover"
                                    />
                                </div>
                                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Upload JPG/PNG/WebP.</p>
                            </div>

                            <div>
                                <textarea
                                    v-model="createForm.description"
                                    rows="3"
                                    placeholder="Description"
                                    class="w-full resize-none rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                                />
                                <p v-if="createErrors.description" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ createErrors.description }}</p>
                            </div>

                            <p v-if="createErrorMessage" class="text-sm text-red-600 dark:text-red-400">
                                {{ createErrorMessage }}
                            </p>

                            <button
                                type="submit"
                                :disabled="createSubmitting"
                                class="w-full rounded-lg bg-zinc-900 px-2 py-1.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                {{ createSubmitting ? 'Creating...' : 'Create book' }}
                            </button>
                        </form>
                    </div>
                </details>

                <details class="rounded-xl border border-zinc-200 bg-white p-0 dark:border-zinc-800 dark:bg-zinc-950">
                    <summary class="cursor-pointer px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-white">
                        Filter
                    </summary>

                    <div class="p-3 pt-0">
                        <div class="grid gap-2">
                            <label class="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                                <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200">Only my books</span>
                                <input
                                    v-model="filters.mine"
                                    type="checkbox"
                                    :disabled="loading"
                                    class="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-zinc-700 dark:focus:ring-zinc-600"
                                    @change="fetchBooks()"
                                />
                            </label>

                            <input
                                v-model="filters.q"
                                type="text"
                                placeholder="Search (title/description)"
                                class="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />

                            <input
                                v-model="filters.author"
                                type="text"
                                placeholder="Author filter"
                                class="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />

                            <input
                                v-model="filters.publication_year"
                                type="number"
                                placeholder="Publication year (optional)"
                                class="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />

                            <div class="grid grid-cols-2 gap-2">
                                <select
                                    v-model="filters.sort"
                                    class="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                                >
                                    <option value="created_at">Newest</option>
                                    <option value="publication_year">Year</option>
                                    <option value="title">Title</option>
                                    <option value="author">Author</option>
                                </select>

                                <select
                                    v-model="filters.direction"
                                    class="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                                >
                                    <option value="desc">Desc</option>
                                    <option value="asc">Asc</option>
                                </select>
                            </div>

                            <div class="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                                <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200">Limit</span>
                                <div class="flex items-center gap-2">
                                    <button
                                        type="button"
                                        class="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                                        :class="filters.limit === 5 ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950' : ''"
                                        @click="filters.limit = 5"
                                    >
                                        5
                                    </button>
                                    <button
                                        type="button"
                                        class="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                                        :class="filters.limit === 10 ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950' : ''"
                                        @click="filters.limit = 10"
                                    >
                                        10
                                    </button>
                                    <button
                                        type="button"
                                        class="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                                        :class="filters.limit === 20 ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950' : ''"
                                        @click="filters.limit = 20"
                                    >
                                        20
                                    </button>
                                    <button
                                        type="button"
                                        class="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                                        :class="filters.limit === 50 ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950' : ''"
                                        @click="filters.limit = 50"
                                    >
                                        50
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                :disabled="loading"
                                @click="fetchBooks()"
                                class="w-full rounded-lg bg-zinc-900 px-2 py-1.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                {{ loading ? 'Loading...' : 'Apply' }}
                            </button>
                        </div>
                    </div>
                </details>
            </section>

            <!-- Results -->
            <section class="rounded-xl border border-zinc-200 bg-white p-3 shadow-none dark:border-zinc-800 dark:bg-zinc-950">
                <div class="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">Results</h3>
                        <p class="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                            {{ books.length }}/{{ meta.total }} (limit {{ meta.limit }}) · Cache:
                            <span class="font-semibold">{{ meta.cached ? 'Hit' : 'Miss' }}</span>
                        </p>
                    </div>

                    <button
                        type="button"
                        class="rounded-lg border border-zinc-300 px-2 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                        @click="
                            filters.mine = false;
                            filters.q = '';
                            filters.author = '';
                            filters.publication_year = '';
                            filters.sort = 'created_at';
                            filters.direction = 'desc';
                            filters.limit = 20;
                            fetchBooks();
                        "
                    >
                        Reset filters
                    </button>
                </div>

                <div v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                    {{ errorMessage }}
                </div>

                <div v-if="loading" class="grid gap-3 md:grid-cols-2">
                    <article v-for="n in 6" :key="`sk-${n}`" class="rounded-lg border border-zinc-200 bg-zinc-50 p-3 shadow-none dark:border-zinc-800 dark:bg-zinc-900 animate-pulse">
                        <div class="mb-2 flex items-start justify-between gap-2">
                            <div class="flex items-center gap-3">
                                <div class="h-9 w-9 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                                <div class="h-9 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                            </div>
                            <div class="h-5 w-14 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        </div>
                        <div class="mb-2 h-28 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                        <div class="space-y-2">
                            <div class="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                            <div class="h-3 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
                            <div class="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                        </div>
                    </article>
                </div>

                <div v-else-if="books.length === 0" class="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    No books match your filters.
                </div>

                <div v-else class="grid gap-3 md:grid-cols-2">
                    <article
                        v-for="book in books"
                        :key="book.id"
                        class="rounded-lg border border-zinc-200 bg-zinc-50 p-3 shadow-none dark:border-zinc-800 dark:bg-zinc-900"
                    >
                        <div class="mb-2 flex items-start justify-between gap-2">
                            <div class="flex items-center gap-2">
                                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                                    {{ book.user?.name ? book.user.name.charAt(0).toUpperCase() : 'U' }}
                                </div>
                                <div>
                                    <div class="text-sm font-semibold text-zinc-900 dark:text-white">
                                        {{ book.title }}
                                    </div>
                                    <div class="text-xs text-zinc-500 dark:text-zinc-400">
                                        {{ book.author }} • {{ book.publication_year }}
                                    </div>
                                </div>
                            </div>

                            <span
                                v-if="isMine(book)"
                                class="rounded-full bg-zinc-900 px-2 py-1 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                            >
                                Mine
                            </span>
                        </div>

                        <img
                            :src="book.image || bookImagePlaceholder"
                            :alt="book.title"
                            class="mb-2 h-[380px] w-full rounded-lg object-cover"
                        />

                        <p class="mb-2 line-clamp-3 text-sm text-zinc-700 dark:text-zinc-200">
                            {{ book.description }}
                        </p>

                        <div class="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span>{{ book.user?.name ?? 'Unknown' }}</span>
                            <span>{{ new Date(book.created_at).toLocaleDateString() }}</span>
                        </div>
                    </article>
                </div>
            </section>
        </div>
    </AppLayout>
</template>

