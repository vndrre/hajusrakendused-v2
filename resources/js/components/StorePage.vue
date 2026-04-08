<script setup lang="ts">
    import StoreWidget from '@/components/StoreWidget.vue';
    import AppLayout from '@/layouts/AppLayout.vue';
    import type { BreadcrumbItem } from '@/types';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ];
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-1 flex-col gap-4 rounded-xl p-4">
            <StoreWidget />
        </div>
    </AppLayout>
</template>