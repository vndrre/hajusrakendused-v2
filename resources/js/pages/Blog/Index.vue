<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';

interface User {
    id: number;
    name: string;
}

interface Comment {
    id: number;
    body: string;
    created_at: string;
    user: User;
}

interface Post {
    id: number;
    title: string;
    description: string;
    created_at: string;
    user: User;
    comments: Comment[];
}

const { posts, authUser, isAdmin } = defineProps<{
    posts: Post[];
    authUser: User | null;
    isAdmin: boolean;
}>();

const createPostForm = useForm({
    title: '',
    description: '',
});

const deletePostForm = useForm({});

const deleteModalOpen = ref(false);
const deleteTargetPostId = ref<number | null>(null);
const deleteSubmitting = ref(false);
const deleteErrorMessage = ref<string | null>(null);

const deleteTargetPost = computed(() => {
    if (!deleteTargetPostId.value) {
        return null;
    }

    return posts.find((post) => post.id === deleteTargetPostId.value) ?? null;
});

const openDeleteModal = (postId: number): void => {
    deleteTargetPostId.value = postId;
    deleteErrorMessage.value = null;
    deleteModalOpen.value = true;
};

const closeDeleteModal = (): void => {
    deleteModalOpen.value = false;
    deleteTargetPostId.value = null;
    deleteErrorMessage.value = null;
    deleteSubmitting.value = false;
};

const confirmDeletePost = (): void => {
    if (!deleteTargetPostId.value) {
        return;
    }

    deleteSubmitting.value = true;
    deletePostForm.delete(`/blog/${deleteTargetPostId.value}`, {
        preserveScroll: true,
        onSuccess: () => closeDeleteModal(),
        onError: () => {
            deleteErrorMessage.value = 'Failed to delete the post.';
            deleteSubmitting.value = false;
        },
        onFinish: () => {
            deleteSubmitting.value = false;
        },
    });
};

const deleteCommentForm = useForm({});
const deleteCommentModalOpen = ref(false);
const deleteTargetCommentId = ref<number | null>(null);
const deleteCommentSubmitting = ref(false);
const deleteCommentErrorMessage = ref<string | null>(null);

const deleteTargetComment = computed(() => {
    if (!deleteTargetCommentId.value) {
        return null;
    }

    for (const post of posts) {
        const found = post.comments.find((comment) => comment.id === deleteTargetCommentId.value);
        if (found) {
            return found;
        }
    }

    return null;
});

const openDeleteCommentModal = (commentId: number): void => {
    deleteTargetCommentId.value = commentId;
    deleteCommentErrorMessage.value = null;
    deleteCommentModalOpen.value = true;
};

const closeDeleteCommentModal = (): void => {
    deleteCommentModalOpen.value = false;
    deleteTargetCommentId.value = null;
    deleteCommentErrorMessage.value = null;
    deleteCommentSubmitting.value = false;
};

const confirmDeleteComment = (): void => {
    if (!deleteTargetCommentId.value) {
        return;
    }

    deleteCommentSubmitting.value = true;
    deleteCommentForm.delete(`/comments/${deleteTargetCommentId.value}`, {
        preserveScroll: true,
        onSuccess: () => closeDeleteCommentModal(),
        onError: () => {
            deleteCommentErrorMessage.value = 'Failed to delete the comment.';
            deleteCommentSubmitting.value = false;
        },
        onFinish: () => {
            deleteCommentSubmitting.value = false;
        },
    });
};

const editPostForm = useForm({
    title: '',
    description: '',
});

const editPostModalOpen = ref(false);
const editTargetPostId = ref<number | null>(null);
const editPostErrorMessage = ref<string | null>(null);

const openEditPostModal = (postId: number): void => {
    const target = posts.find((post) => post.id === postId) ?? null;

    if (!target) {
        return;
    }

    editTargetPostId.value = postId;
    editPostErrorMessage.value = null;
    editPostForm.reset();
    editPostForm.title = target.title;
    editPostForm.description = target.description;
    editPostModalOpen.value = true;
};

const closeEditPostModal = (): void => {
    editPostModalOpen.value = false;
    editTargetPostId.value = null;
    editPostErrorMessage.value = null;
    editPostForm.reset();
};

const confirmEditPost = (): void => {
    if (!editTargetPostId.value) {
        return;
    }

    editPostErrorMessage.value = null;

    editPostForm.put(`/blog/${editTargetPostId.value}`, {
        preserveScroll: true,
        onSuccess: () => closeEditPostModal(),
        onError: () => {
            editPostErrorMessage.value = 'Failed to update the post.';
        },
    });
};

const editCommentForm = useForm({
    body: '',
});

const editCommentModalOpen = ref(false);
const editTargetCommentId = ref<number | null>(null);
const editCommentErrorMessage = ref<string | null>(null);

const getCommentById = (commentId: number): Comment | null => {
    for (const post of posts) {
        const found = post.comments.find((comment) => comment.id === commentId);

        if (found) {
            return found;
        }
    }

    return null;
};

const openEditCommentModal = (commentId: number): void => {
    const target = getCommentById(commentId);

    if (!target) {
        return;
    }

    editTargetCommentId.value = commentId;
    editCommentErrorMessage.value = null;
    editCommentForm.reset();
    editCommentForm.body = target.body;
    editCommentModalOpen.value = true;
};

const closeEditCommentModal = (): void => {
    editCommentModalOpen.value = false;
    editTargetCommentId.value = null;
    editCommentErrorMessage.value = null;
    editCommentForm.reset();
};

const confirmEditComment = (): void => {
    if (!editTargetCommentId.value) {
        return;
    }

    editCommentErrorMessage.value = null;

    editCommentForm.put(`/comments/${editTargetCommentId.value}`, {
        preserveScroll: true,
        onSuccess: () => closeEditCommentModal(),
        onError: () => {
            editCommentErrorMessage.value = 'Failed to update the comment.';
        },
    });
};

const commentForms = new Map<number, ReturnType<typeof useForm>>();

const getCommentForm = (postId: number) => {
    if (!commentForms.has(postId)) {
        commentForms.set(
            postId,
            useForm({
                body: '',
            }),
        );
    }

    return commentForms.get(postId)!;
};
</script>

<template>
    <Head title="Blog" />

    <AppLayout>
        <div class="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
            <div class="h-full rounded-3xl border border-zinc-200 bg-zinc-100 p-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                <div class="h-full rounded-[calc(theme(borderRadius.3xl)-2px)] bg-white p-4 dark:bg-zinc-950">
                    <div class="mb-4 flex items-center justify-between">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Blog</p>
                            <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">Community posts</h2>
                        </div>
                        <div class="hidden rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 sm:block">
                            Share updates & discuss
                        </div>
                    </div>

                    <div class="space-y-4">
                        <!-- Composer -->
                        <div class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                            <div class="flex gap-3">
                                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                                    {{ authUser?.name?.charAt(0).toUpperCase() ?? 'U' }}
                                </div>
                                <form
                                    class="flex-1 space-y-3"
                                    @submit.prevent="
                                        createPostForm.post('/blog', {
                                            preserveScroll: true,
                                            onSuccess: () => createPostForm.reset(),
                                        })
                                    "
                                >
                                    <input
                                        v-model="createPostForm.title"
                                        type="text"
                                        placeholder="Post title"
                                        class="w-full border-none bg-transparent text-base font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0 dark:text-white"
                                    />
                                    <textarea
                                        v-model="createPostForm.description"
                                        rows="2"
                                        placeholder="What's happening?"
                                        class="w-full resize-none border-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-0 dark:text-zinc-100"
                                    />
                                    <div class="flex items-center justify-between pt-2">
                                        <div class="min-h-[18px] text-xs text-red-600 dark:text-red-400">
                                            <div v-if="createPostForm.errors.title" class="mb-1">
                                                {{ createPostForm.errors.title }}
                                            </div>
                                            <div v-else-if="createPostForm.errors.description">
                                                {{ createPostForm.errors.description }}
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            :disabled="createPostForm.processing"
                                            class="rounded-full cursor-pointer bg-zinc-900 px-4 py-1.5 text-sm font-semibold text-white shadow hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                        >
                                            Post
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Feed -->
                        <div class="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-700 dark:bg-zinc-900">
                            <div
                                v-if="posts.length === 0"
                                class="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            >
                                No posts yet. Be the first to share something.
                            </div>

                            <article
                                v-for="post in posts"
                                :key="post.id"
                                class="space-y-3 p-4"
                            >
                                <div class="flex gap-3">
                                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">
                                        {{ post.user.name.charAt(0).toUpperCase() }}
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-2">
                                                <span class="text-sm font-semibold text-zinc-900 dark:text-white">{{ post.user.name }}</span>
                                                <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ new Date(post.created_at).toLocaleString() }}</span>
                                            </div>
                                            <div
                                v-if="authUser && (isAdmin || Number(authUser.id) === Number(post.user.id))"
                                                class="flex gap-2 text-xs"
                                            >
                                <button
                                    v-if="Number(authUser.id) === Number(post.user.id)"
                                    type="button"
                                    @click="openEditPostModal(post.id)"
                                    class="rounded-md cursor-pointer px-2 py-1 text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-950/30"
                                >
                                    Edit
                                </button>

                                                <button
                                                    type="button"
                                                    @click="openDeleteModal(post.id)"
                                                    class="rounded-md cursor-pointer px-2 py-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <h3 class="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">{{ post.title }}</h3>
                                        <p class="mt-1 text-sm text-zinc-800 dark:text-zinc-100">{{ post.description }}</p>
                                    </div>
                                </div>

                                <!-- Comments -->
                                <div class="space-y-3 border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
                                    <div
                                        v-for="comment in post.comments"
                                        :key="comment.id"
                                        class="flex items-start justify-between gap-2 text-sm"
                                    >
                                        <div>
                                            <div class="flex items-center gap-2">
                                                <span class="font-semibold text-zinc-900 dark:text-white">{{ comment.user.name }}</span>
                                                <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ new Date(comment.created_at).toLocaleString() }}</span>
                                            </div>
                                            <p class="mt-1 text-zinc-800 dark:text-zinc-100">{{ comment.body }}</p>
                                        </div>

                                        <div
                                            v-if="authUser && (isAdmin || Number(authUser.id) === Number(comment.user.id))"
                                            class="ml-2 shrink-0 text-xs"
                                        >
                                            <button
                                                v-if="
                                                    Number(authUser.id) === Number(comment.user.id)
                                                "
                                                type="button"
                                                @click="openEditCommentModal(comment.id)"
                                                class="mb-1 block w-full rounded-md cursor-pointer px-2 py-1 text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-950/30"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                @click="openDeleteCommentModal(comment.id)"
                                                class="rounded-md cursor-pointer px-2 py-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Add comment -->
                                    <form
                                        v-if="authUser"
                                        class="pt-1 flex items-center gap-2"
                                        @submit.prevent="
                                            getCommentForm(post.id).post(
                                                `/blog/${post.id}/comments`,
                                                {
                                                    preserveScroll: true,
                                                    onSuccess: () => getCommentForm(post.id).reset(),
                                                },
                                            )
                                        "
                                    >
                                        <input
                                            v-model="getCommentForm(post.id).body"
                                            type="text"
                                            placeholder="Add a comment..."
                                            class="flex-1 rounded-full border border-zinc-300 bg-transparent px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:text-zinc-100"
                                        />
                                        <button
                                            type="submit"
                                            :disabled="getCommentForm(post.id).processing"
                                            class="rounded-full cursor-pointer bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                        >
                                            Reply
                                        </button>
                                    </form>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit post modal (allows updating title/description) -->
            <div
                v-if="editPostModalOpen"
                class="fixed inset-0 z-[10000] flex items-center justify-center"
                role="dialog"
                aria-modal="true"
            >
                <div
                    class="absolute inset-0 z-[10000] bg-black/60"
                    @click="closeEditPostModal"
                ></div>

                <div
                    class="relative z-[10001] w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                >
                    <h3 class="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                        Edit post
                    </h3>

                    <div class="space-y-3">
                        <div>
                            <label
                                class="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                                for="edit-post-title"
                            >
                                Title
                            </label>
                            <input
                                id="edit-post-title"
                                v-model="editPostForm.title"
                                type="text"
                                class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                            <p
                                v-if="editPostForm.errors.title"
                                class="mt-1 text-xs text-red-600 dark:text-red-400"
                            >
                                {{ editPostForm.errors.title }}
                            </p>
                        </div>

                        <div>
                            <label
                                class="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                                for="edit-post-description"
                            >
                                Description
                            </label>
                            <textarea
                                id="edit-post-description"
                                v-model="editPostForm.description"
                                rows="3"
                                class="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                            <p
                                v-if="editPostForm.errors.description"
                                class="mt-1 text-xs text-red-600 dark:text-red-400"
                            >
                                {{ editPostForm.errors.description }}
                            </p>
                        </div>

                        <p
                            v-if="editPostErrorMessage"
                            class="text-sm font-medium text-red-600 dark:text-red-400"
                        >
                            {{ editPostErrorMessage }}
                        </p>
                    </div>

                    <div class="mt-5 flex gap-2">
                        <button
                            type="button"
                            @click="closeEditPostModal"
                            :disabled="editPostForm.processing"
                            class="flex-1 rounded-xl bg-zinc-200 px-4 py-2 text-zinc-900 transition hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            @click="confirmEditPost"
                            :disabled="editPostForm.processing"
                            class="flex-1 rounded-xl bg-black px-4 py-2 text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            {{
                                editPostForm.processing ? 'Saving...' : 'Save'
                            }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Edit comment modal (allows updating comment body) -->
            <div
                v-if="editCommentModalOpen"
                class="fixed inset-0 z-[10000] flex items-center justify-center"
                role="dialog"
                aria-modal="true"
            >
                <div
                    class="absolute inset-0 z-[10000] bg-black/60"
                    @click="closeEditCommentModal"
                ></div>

                <div
                    class="relative z-[10001] w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                >
                    <h3 class="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                        Edit comment
                    </h3>

                    <div class="space-y-3">
                        <div>
                            <label
                                class="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                                for="edit-comment-body"
                            >
                                Comment
                            </label>
                            <textarea
                                id="edit-comment-body"
                                v-model="editCommentForm.body"
                                rows="3"
                                class="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                            <p
                                v-if="editCommentForm.errors.body"
                                class="mt-1 text-xs text-red-600 dark:text-red-400"
                            >
                                {{ editCommentForm.errors.body }}
                            </p>
                        </div>

                        <p
                            v-if="editCommentErrorMessage"
                            class="text-sm font-medium text-red-600 dark:text-red-400"
                        >
                            {{ editCommentErrorMessage }}
                        </p>
                    </div>

                    <div class="mt-5 flex gap-2">
                        <button
                            type="button"
                            @click="closeEditCommentModal"
                            :disabled="editCommentForm.processing"
                            class="flex-1 rounded-xl bg-zinc-200 px-4 py-2 text-zinc-900 transition hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            @click="confirmEditComment"
                            :disabled="editCommentForm.processing"
                            class="flex-1 rounded-xl bg-black px-4 py-2 text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            {{
                                editCommentForm.processing
                                    ? 'Saving...'
                                    : 'Save'
                            }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Delete post confirmation modal (prevents accidental deletes) -->
            <div
                v-if="deleteModalOpen"
                class="fixed inset-0 z-[10000] flex items-center justify-center"
                role="dialog"
                aria-modal="true"
            >
                <div
                    class="absolute inset-0 z-[10000] bg-black/60"
                    @click="closeDeleteModal"
                ></div>

                <div
                    class="relative z-[10001] w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                >
                    <h3 class="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                        Delete post
                    </h3>

                    <p class="text-sm text-zinc-700 dark:text-zinc-300">
                        Are you sure you want to delete
                        <span class="font-semibold">
                            {{ deleteTargetPost?.title ?? `#${deleteTargetPostId}` }}
                        </span>
                        ?
                    </p>

                    <p
                        v-if="deleteErrorMessage"
                        class="mt-3 text-sm font-medium text-red-600 dark:text-red-400"
                    >
                        {{ deleteErrorMessage }}
                    </p>

                    <div class="mt-5 flex gap-2">
                        <button
                            type="button"
                            @click="closeDeleteModal"
                            :disabled="deleteSubmitting"
                            class="flex-1 rounded-xl bg-zinc-200 px-4 py-2 text-zinc-900 transition hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            @click="confirmDeletePost"
                            :disabled="deleteSubmitting"
                            class="flex-1 rounded-xl bg-black px-4 py-2 text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            {{ deleteSubmitting ? 'Deleting...' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Delete comment confirmation modal (prevents accidental deletes) -->
            <div
                v-if="deleteCommentModalOpen"
                class="fixed inset-0 z-[10000] flex items-center justify-center"
                role="dialog"
                aria-modal="true"
            >
                <div
                    class="absolute inset-0 z-[10000] bg-black/60"
                    @click="closeDeleteCommentModal"
                ></div>

                <div
                    class="relative z-[10001] w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                >
                    <h3 class="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                        Delete comment
                    </h3>

                    <p class="text-sm text-zinc-700 dark:text-zinc-300">
                        Are you sure you want to delete
                        <span class="font-semibold">
                            {{ deleteTargetComment?.body ?? `#${deleteTargetCommentId}` }}
                        </span>
                        ?
                    </p>

                    <p
                        v-if="deleteCommentErrorMessage"
                        class="mt-3 text-sm font-medium text-red-600 dark:text-red-400"
                    >
                        {{ deleteCommentErrorMessage }}
                    </p>

                    <div class="mt-5 flex gap-2">
                        <button
                            type="button"
                            @click="closeDeleteCommentModal"
                            :disabled="deleteCommentSubmitting"
                            class="flex-1 rounded-xl bg-zinc-200 px-4 py-2 text-zinc-900 transition hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            @click="confirmDeleteComment"
                            :disabled="deleteCommentSubmitting"
                            class="flex-1 rounded-xl bg-black px-4 py-2 text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            {{ deleteCommentSubmitting ? 'Deleting...' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

