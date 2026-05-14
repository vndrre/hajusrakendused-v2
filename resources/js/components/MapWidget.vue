<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import axios from 'axios';
import L from 'leaflet';
import areasRoutes from '@/routes/areas';
import areasApiRoutes from '@/routes/areas/api';
import markersRoutes from '@/routes/markers';
import markersApiRoutes from '@/routes/markers/api';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import 'leaflet/dist/leaflet.css';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

interface Marker {
    id: number;
    name: string;
    latitude: number | string;
    longitude: number | string;
    description?: string;
    added: string;
    edited?: string;
}

interface Area {
    id: number;
    name: string;
    description?: string;
    area: Array<[number, number]>;
    centroid_latitude?: number | string | null;
    centroid_longitude?: number | string | null;
    added: string;
    edited?: string;
}

const mapContainer = ref<HTMLElement>();
const map = ref<any>();
const markers = ref<Marker[]>([]);
const showForm = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const editingMarkerId = ref<number | null>(null);
const saving = ref(false);
const newMarker = ref({
    name: '',
    latitude: 0,
    longitude: 0,
    description: '',
});

const mapMarkers = ref<any[]>([]);
const areas = ref<Area[]>([]);
const showAreaForm = ref(false);
const drawingArea = ref(false);
const areaVertices = ref<Array<[number, number]>>([]);
const currentAreaPreview = ref<any | null>(null);
const areaLayers = ref<any[]>([]);
const areaSaving = ref(false);
const areaFormMode = ref<'create' | 'edit'>('create');
const editingAreaId = ref<number | null>(null);
const newArea = ref({
    name: '',
    description: '',
    area: [] as Array<[number, number]>,
});

const MARKERS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2xUrl,
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
});
const page = usePage<{
    auth?: { user?: { id?: number } };
}>();

const authUserId = page.props.auth?.user?.id ?? null;
const MARKERS_CACHE_KEY = authUserId
    ? `map_markers_cache_v1_user_${authUserId}`
    : 'map_markers_cache_v1_guest';

interface MarkersCachePayload {
    savedAt: number;
    markers: Marker[];
}

const readMarkersCachePayload = (): MarkersCachePayload | null => {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem(MARKERS_CACHE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as MarkersCachePayload;
        if (!parsed || typeof parsed.savedAt !== 'number' || !Array.isArray(parsed.markers)) return null;

        return parsed;
    } catch {
        return null;
    }
};

const loadMarkersFromCache = (): Marker[] | null => {
    const payload = readMarkersCachePayload();
    if (!payload) return null;

    const isFresh = Date.now() - payload.savedAt < MARKERS_CACHE_TTL_MS;
    return isFresh ? payload.markers : null;
};

const saveMarkersToCache = (markersToSave: Marker[]): void => {
    if (typeof window === 'undefined') return;

    const payload: MarkersCachePayload = {
        savedAt: Date.now(),
        markers: markersToSave,
    };

    try {
        window.localStorage.setItem(MARKERS_CACHE_KEY, JSON.stringify(payload));
    } catch {
        // Ignore localStorage failures (quota/private mode). Map still works via API.
    }
};

const calculateCentroid = (points: Array<[number, number]>): { latitude: number | null; longitude: number | null } => {
    if (points.length === 0) {
        return { latitude: null, longitude: null };
    }

    const total = points.reduce(
        (acc, [lat, lng]) => {
            acc.latitude += lat;
            acc.longitude += lng;
            return acc;
        },
        { latitude: 0, longitude: 0 },
    );

    return {
        latitude: total.latitude / points.length,
        longitude: total.longitude / points.length,
    };
};

const clearAreaDrawing = (): void => {
    drawingArea.value = false;
    areaVertices.value = [];
    showAreaForm.value = false;
    areaFormMode.value = 'create';
    editingAreaId.value = null;
    newArea.value = { name: '', description: '', area: [] };
    deleteTargetArea.value = null;

    if (currentAreaPreview.value && map.value) {
        try {
            currentAreaPreview.value.remove();
        } catch {
            map.value.removeLayer(currentAreaPreview.value);
        }
    }
    currentAreaPreview.value = null;
};

const editArea = (area: Area): void => {
    areaFormMode.value = 'edit';
    editingAreaId.value = area.id;
    showAreaForm.value = true;
    showForm.value = false;
    drawingArea.value = false;
    areaVertices.value = area.area.map((point) => [point[0], point[1]] as [number, number]);
    newArea.value = {
        name: area.name,
        description: area.description || '',
        area: [...areaVertices.value],
    };
    updateAreaPreview();
};

const syncAreaVertices = (): void => {
    newArea.value.area = areaVertices.value.map((point) => [point[0], point[1]] as [number, number]);
    updateAreaPreview();
};

const removeAreaVertex = (index: number): void => {
    if (areaVertices.value.length <= 3) {
        return;
    }

    areaVertices.value.splice(index, 1);
    syncAreaVertices();
};

const updateAreaPreview = (): void => {
    if (!map.value || !L) {
        return;
    }

    if (currentAreaPreview.value) {
        try {
            currentAreaPreview.value.remove();
        } catch {
            map.value.removeLayer(currentAreaPreview.value);
        }
    }

    if (areaVertices.value.length === 0) {
        currentAreaPreview.value = null;
        return;
    }

    currentAreaPreview.value = areaVertices.value.length > 2
        ? L.polygon(areaVertices.value, { color: '#2563eb', fillOpacity: 0.15, weight: 3, dashArray: '6 4' }).addTo(map.value)
        : L.polyline(areaVertices.value, { color: '#2563eb', weight: 3, dashArray: '6 4' }).addTo(map.value);
};

const parseCoordinate = (value: number | string | null | undefined): number | null => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'string') {
        // Accept both "59.123" and "59,123" inputs.
        const normalized = value.trim().replace(',', '.');
        if (normalized.length === 0) {
            return null;
        }

        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
};

const formatCoordinate = (value: number | string): string => {
    const parsed = parseCoordinate(value);
    return parsed === null ? '—' : parsed.toFixed(6);
};

const formatAreaCentroid = (area: Area): string => {
    const latitude = parseCoordinate(area.centroid_latitude);
    const longitude = parseCoordinate(area.centroid_longitude);

    return `${latitude === null ? '—' : latitude.toFixed(6)}, ${longitude === null ? '—' : longitude.toFixed(6)}`;
};

const escapeHtml = (value: string): string => {
    // Minimal escaping for marker popups.
    return value.replace(/[&<>"']/g, (char) => {
        switch (char) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case '\'':
                return '&#039;';
            default:
                return char;
        }
    });
};

const initMap = async () => {
    if (!mapContainer.value) {
        return;
    }

    try {
        // Start at the global view; user can pan/zoom freely anywhere.
        map.value = L.map(mapContainer.value).setView([0, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map.value);

        map.value.on('click', (event: any) => {
            if (!event.latlng) {
                return;
            }

            if (drawingArea.value) {
                addAreaVertex(event.latlng.lat, event.latlng.lng);
                return;
            }

            showMarkerForm(event.latlng.lat, event.latlng.lng);
        });

        setTimeout(() => {
            map.value?.invalidateSize();
        }, 0);

        await Promise.all([loadMarkers(), loadAreas()]);
    } catch (error) {
        console.error('Error initializing map:', error);
    }
};

const loadMarkers = async () => {
    try {
        const cachedMarkers = loadMarkersFromCache();
        if (cachedMarkers) {
            markers.value = cachedMarkers;
            updateMapMarkers();
        }

        const response = await axios.get(markersApiRoutes.index.url());
        markers.value = response.data;
        updateMapMarkers();

        saveMarkersToCache(markers.value);
    } catch (error) {
        console.error('Error loading markers:', error);
    }
};

const loadAreas = async () => {
    try {
        const response = await axios.get(areasApiRoutes.index.url());
        areas.value = response.data;
        updateMapAreas();
    } catch (error) {
        console.error('Error loading areas:', error);
    }
};

const updateMapAreas = () => {
    areaLayers.value.forEach((layer) => {
        try {
            layer.remove();
        } catch {
            if (map.value) {
                map.value.removeLayer(layer);
            }
        }
    });
    areaLayers.value = [];

    if (!map.value || !L) {
        return;
    }

    areas.value.forEach((area) => {
        if (!Array.isArray(area.area) || area.area.length < 3) {
            return;
        }

        const vertices: Array<[number, number]> = area.area.map((point) => [point[0], point[1]] as [number, number]);
        const polygon = L.polygon(vertices, {
            color: '#16a34a',
            fillOpacity: 0.18,
            weight: 2,
        }).addTo(map.value);

        polygon.bindPopup(
            `<div style="max-width: 260px">
                <div style="font-weight: 700; margin-bottom: 4px">${escapeHtml(area.name)}</div>
                <div style="font-size: 12px; opacity: .8; margin-bottom: 8px">Area with ${area.area.length} points</div>
                ${area.description ? `<div style="font-size: 12px; margin-bottom: 10px">${escapeHtml(area.description)}</div>` : ''}
                <div style="display:flex; gap:8px">
                    <button type="button" data-action="edit" data-area-id="${area.id}" style="flex:1; padding:6px 8px; border-radius:8px; border:1px solid #111827; background:#111827; color:white; cursor:pointer">Edit</button>
                    <button type="button" data-action="delete" data-area-id="${area.id}" style="flex:1; padding:6px 8px; border-radius:8px; border:1px solid #111827; background:#000000; color:white; cursor:pointer">Delete</button>
                </div>
            </div>`,
        );

        areaLayers.value.push(polygon);

        polygon.on('popupopen', (event: any) => {
            const popupEl = event?.popup?.getElement?.() as HTMLElement | null;
            if (!popupEl) return;

            const editBtn = popupEl.querySelector('button[data-action="edit"][data-area-id]') as HTMLButtonElement | null;
            const deleteBtn = popupEl.querySelector('button[data-action="delete"][data-area-id]') as HTMLButtonElement | null;

            editBtn?.addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                editArea(area);
                event?.popup?.remove?.();
            });

            deleteBtn?.addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                openDeleteAreaModal(area);
                event?.popup?.remove?.();
            });
        });
    });
};

const updateMapMarkers = () => {
    // Clear existing markers from the map
    mapMarkers.value.forEach((markerInstance) => {
        try {
            markerInstance.remove();
        } catch {
            if (map.value) {
                map.value.removeLayer(markerInstance);
            }
        }
    });
    mapMarkers.value = [];

    if (!map.value || !L) {
        return;
    }

    const validLatLngs: Array<[number, number]> = [];

    // Add new markers
    markers.value.forEach((marker) => {
        const latitude = parseCoordinate(marker.latitude);
        const longitude = parseCoordinate(marker.longitude);

        if (latitude === null || longitude === null) {
            // Avoid silently plotting at (0,0); just skip invalid records.
            console.warn('Skipping marker with invalid coordinates', marker);
            return;
        }

        validLatLngs.push([latitude, longitude]);

        const leafletMarker = L.marker([latitude, longitude])
            .addTo(map.value)
            .bindPopup(
                `
                <div style="max-width: 260px">
                    <div style="font-weight: 700; margin-bottom: 4px">${escapeHtml(marker.name)}</div>
                    <div style="font-size: 12px; opacity: .8; margin-bottom: 8px">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</div>
                    ${
                        marker.description
                            ? `<div style="font-size: 12px; margin-bottom: 10px">${escapeHtml(
                                  marker.description,
                              )}</div>`
                            : ''
                    }
                    <div style="display:flex; gap:8px">
                        <button type="button" data-action="edit" data-marker-id="${marker.id}" style="flex:1; padding:6px 8px; border-radius:8px; border:1px solid #111827; background:#111827; color:white; cursor:pointer">Edit</button>
                        <button type="button" data-action="delete" data-marker-id="${marker.id}" style="flex:1; padding:6px 8px; border-radius:8px; border:1px solid #111827; background:#000000; color:white; cursor:pointer">Delete</button>
                    </div>
                </div>
            `,
            );

        mapMarkers.value.push(leafletMarker);

        leafletMarker.on('popupopen', (event: any) => {
            const popupEl = event?.popup?.getElement?.() as HTMLElement | null;
            if (!popupEl) return;

            const editBtn = popupEl.querySelector('button[data-action="edit"]') as HTMLButtonElement | null;
            const deleteBtn = popupEl.querySelector('button[data-action="delete"]') as HTMLButtonElement | null;

            editBtn?.addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                editMarker(marker);
                event?.popup?.remove?.();
            });

            deleteBtn?.addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                openDeleteModal(marker);
                event?.popup?.remove?.();
            });
        });
    });

    // Fit map to markers when possible so markers appear in correct positions.
    if (validLatLngs.length > 0) {
        const bounds = L.latLngBounds(validLatLngs);
        if (bounds.isValid()) {
            map.value.fitBounds(bounds, { padding: [24, 24] });
        }
    }

    // Leaflet can misplace markers if the container resized (e.g. when form opens).
    setTimeout(() => {
        map.value?.invalidateSize();
    }, 0);
};

const showMarkerForm = (lat: number, lng: number) => {
    formMode.value = 'create';
    editingMarkerId.value = null;

    newMarker.value = {
        name: '',
        latitude: lat,
        longitude: lng,
        description: '',
    };
    showForm.value = true;
};

const addAreaVertex = (lat: number, lng: number) => {
    areaVertices.value.push([lat, lng]);
    updateAreaPreview();
};

const startAreaDrawing = (): void => {
    if (showForm.value) {
        showForm.value = false;
    }

    showAreaForm.value = false;
    drawingArea.value = true;
    areaVertices.value = [];
    currentAreaPreview.value = null;
};

const finishAreaDrawing = (): void => {
    if (areaVertices.value.length < 3) {
        alert('Please add at least three points to define an area.');
        return;
    }

    drawingArea.value = false;
    newArea.value = {
        name: '',
        description: '',
        area: [...areaVertices.value],
    };
    showAreaForm.value = true;
};

const cancelAreaDrawing = (): void => {
    clearAreaDrawing();
};

const saveArea = async () => {
    areaSaving.value = true;
    try {
        let response;

        if (areaFormMode.value === 'edit' && editingAreaId.value !== null) {
            response = await axios.put(`${AREAS_API_URL}/${editingAreaId.value}`, newArea.value);
            areas.value = areas.value.map((existing) => {
                if (existing.id !== response.data.id) {
                    return existing;
                }

                return response.data;
            });
        } else {
            response = await axios.post(AREAS_API_URL, newArea.value);
            areas.value.push(response.data);
        }

        updateMapAreas();
        areaSaving.value = false;
        clearAreaDrawing();
    } catch (error) {
        console.error('Error saving area:', error);
        alert('Error saving area');
        areaSaving.value = false;
    }
};

const saveMarker = async () => {
    saving.value = true;
    try {
        if (formMode.value === 'edit' && editingMarkerId.value !== null) {
            const response = await axios.put(markersRoutes.update.url(editingMarkerId.value), newMarker.value);

            markers.value = markers.value.map((existing) => {
                if (existing.id !== response.data.id) {
                    return existing;
                }

                return response.data;
            });
        } else {
            const response = await axios.post(markersRoutes.store.url(), newMarker.value);
            markers.value.push(response.data);
        }

        updateMapMarkers();
        saveMarkersToCache(markers.value);
        showForm.value = false;
        formMode.value = 'create';
        editingMarkerId.value = null;
        newMarker.value = { name: '', latitude: 0, longitude: 0, description: '' };
    } catch (error) {
        console.error('Error saving marker:', error);
        alert('Error saving marker');
    } finally {
        saving.value = false;
    }
};

const cancelForm = () => {
    showForm.value = false;
    formMode.value = 'create';
    editingMarkerId.value = null;
    newMarker.value = { name: '', latitude: 0, longitude: 0, description: '' };
};

const editMarker = (marker: Marker) => {
    formMode.value = 'edit';
    editingMarkerId.value = marker.id;

    const latitude = parseCoordinate(marker.latitude);
    const longitude = parseCoordinate(marker.longitude);

    newMarker.value = {
        name: marker.name,
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        description: marker.description || '',
    };
    showForm.value = true;
};

const deleteModalOpen = ref(false);
const deleteTargetMarker = ref<Marker | null>(null);
const deleteTargetArea = ref<Area | null>(null);
const deleteSubmitting = ref(false);
const deleteErrorMessage = ref<string | null>(null);

const openDeleteModal = (marker: Marker): void => {
    deleteTargetMarker.value = marker;
    deleteTargetArea.value = null;
    deleteErrorMessage.value = null;
    deleteModalOpen.value = true;
};

const openDeleteAreaModal = (area: Area): void => {
    deleteTargetArea.value = area;
    deleteTargetMarker.value = null;
    deleteErrorMessage.value = null;
    deleteModalOpen.value = true;
};

const closeDeleteModal = (): void => {
    deleteModalOpen.value = false;
    deleteTargetMarker.value = null;
    deleteTargetArea.value = null;
    deleteErrorMessage.value = null;
    deleteSubmitting.value = false;
};

const confirmDeleteMarker = async (): Promise<void> => {
    if (!deleteTargetMarker.value) {
        return;
    }

    deleteSubmitting.value = true;
    try {
        await axios.delete(markersRoutes.destroy.url(deleteTargetMarker.value.id));
        markers.value = markers.value.filter((m) => m.id !== deleteTargetMarker.value?.id);
        updateMapMarkers();
        saveMarkersToCache(markers.value);
        closeDeleteModal();
    } catch (error) {
        console.error('Error deleting marker:', error);
        deleteErrorMessage.value = 'Viga markeri kustutamisel';
    } finally {
        deleteSubmitting.value = false;
    }
};

const confirmDeleteArea = async (): Promise<void> => {
    if (!deleteTargetArea.value) {
        return;
    }

    deleteSubmitting.value = true;
    try {
        await axios.delete(`${AREAS_API_URL}/${deleteTargetArea.value.id}`);
        areas.value = areas.value.filter((area) => area.id !== deleteTargetArea.value?.id);
        updateMapAreas();
        closeDeleteModal();
    } catch (error) {
        console.error('Error deleting area:', error);
        deleteErrorMessage.value = 'Viga ala kustutamisel';
    } finally {
        deleteSubmitting.value = false;
    }
};

const confirmDelete = async (): Promise<void> => {
    if (deleteTargetMarker.value) {
        await confirmDeleteMarker();
    } else if (deleteTargetArea.value) {
        await confirmDeleteArea();
    }
};

onMounted(() => {
    nextTick(() => {
        initMap();
    });
});

onBeforeUnmount(() => {
    if (map.value) {
        map.value.remove();
        map.value = null;
    }
});

// Leaflet needs invalidateSize when layout changes (this component grows/shrinks
// when `showForm` or `showAreaForm` toggles).
watch([showForm, showAreaForm], () => {
    nextTick(() => {
        map.value?.invalidateSize?.();
    });
});
</script>

<template>
    <div class="rounded-3xl p-6 shadow-xl h-full w-full">
        <h2 class="mb-4 text-2xl font-semibold text-zinc-900 dark:text-white">
            Map Widget
        </h2>


        <div class="grid gap-4 xl:grid-cols-3 h-full w-full">
            <!-- Map Container -->
            <div class="mb-4 w-full xl:col-span-2">
                <div
                    ref="mapContainer"
                    class="h-full w-full rounded-2xl border border-zinc-300 dark:border-zinc-700"
                ></div>
            </div>
            <div class="mb-4 w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
                <div class="space-y-4">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 class="text-lg font-medium text-zinc-900 dark:text-white">Map actions</h3>
                            <p class="text-sm text-zinc-600 dark:text-zinc-400">
                                Click the map to create a marker, or draw an area with the button below.
                            </p>
                        </div>
                        <button
                            type="button"
                            @click="startAreaDrawing"
                            class="rounded-xl bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                        >
                            Draw area
                        </button>
                    </div>

                    <div v-if="drawingArea" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                        <div class="flex items-center justify-between gap-3">
                            <div>
                                <p class="font-medium">Drawing area</p>
                                <p class="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
                                    Click on the map to add vertices. When you have at least three points, finish the shape.
                                </p>
                            </div>
                            <span class="rounded-full bg-emerald-700 px-3 py-1 text-xs text-white dark:bg-emerald-300 dark:text-zinc-900">
                                {{ areaVertices.length }} points
                            </span>
                        </div>
                        <div class="mt-4 flex flex-wrap gap-2">
                            <button
                                type="button"
                                @click="finishAreaDrawing"
                                class="rounded-xl bg-emerald-700 px-4 py-2 text-white transition hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                            >
                                Finish area
                            </button>
                            <button
                                type="button"
                                @click="cancelAreaDrawing"
                                class="rounded-xl bg-zinc-700 px-4 py-2 text-white transition hover:bg-zinc-600 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div v-if="showAreaForm" class="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
                        <h3 class="mb-3 text-lg font-medium text-zinc-900 dark:text-white">{{ areaFormMode === 'edit' ? 'Edit area' : 'Add new area' }}</h3>
                        <form @submit.prevent="saveArea" class="space-y-3">
                            <div>
                                <label class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Name
                                </label>
                                <input
                                    v-model="newArea.name"
                                    type="text"
                                    required
                                    class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-zinc-500"
                                    placeholder="Area name"
                                />
                            </div>
                            <div>
                                <label class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Description
                                </label>
                                <textarea
                                    v-model="newArea.description"
                                    rows="3"
                                    class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-zinc-500"
                                    placeholder="Optional description"
                                ></textarea>
                            </div>
                            <div class="text-sm text-zinc-600 dark:text-zinc-400">
                                Area vertices: {{ areaVertices.length }}
                            </div>
                            <div class="flex gap-2">
                                <button
                                    type="submit"
                                    :disabled="areaSaving"
                                    class="rounded-xl bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                                >
                                    {{ areaSaving ? 'Saving...' : areaFormMode === 'edit' ? 'Update area' : 'Save area' }}
                                </button>
                                <button
                                    type="button"
                                    @click="cancelAreaDrawing"
                                    class="rounded-xl bg-zinc-600 px-4 py-2 text-white transition hover:bg-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                    <div v-if="showForm" class="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
                        <h3 class="mb-3 text-lg font-medium text-zinc-900 dark:text-white">
                            {{ formMode === 'edit' ? 'Edit marker' : 'Add new marker' }}
                        </h3>
                        <form @submit.prevent="saveMarker" class="space-y-3">
                            <div>
                                <label class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Name
                                </label>
                                <input
                                    v-model="newMarker.name"
                                    type="text"
                                    required
                                    class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-zinc-500"
                                    placeholder="Marker name"
                                />
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Latitude
                                    </label>
                                    <input
                                        v-model.number="newMarker.latitude"
                                        type="number"
                                        step="any"
                                        required
                                        min="-90"
                                        max="90"
                                        class="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                                    />
                                </div>
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Longitude
                                    </label>
                                    <input
                                        v-model.number="newMarker.longitude"
                                        type="number"
                                        step="any"
                                        required
                                        min="-180"
                                        max="180"
                                        class="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <label class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Description
                                </label>
                                <textarea
                                    v-model="newMarker.description"
                                    rows="3"
                                    class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-zinc-500"
                                    placeholder="Optional description"
                                ></textarea>
                            </div>
                            <div class="flex gap-2">
                                <button
                                    type="submit"
                                    :disabled="saving"
                                    class="rounded-xl bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                                >
                                    {{ saving ? 'Saving...' : formMode === 'edit' ? 'Update' : 'Save' }}
                                </button>
                                <button
                                    type="button"
                                    @click="cancelForm"
                                    class="rounded-xl bg-zinc-600 px-4 py-2 text-white transition hover:bg-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                    <div class="w-full space-y-6">
                        <div v-if="markers.length > 0" class="space-y-2">
                            <h3 class="text-lg font-medium text-zinc-900 dark:text-white">Markers</h3>
                            <div class="space-y-2">
                                <div
                                    v-for="marker in markers"
                                    :key="marker.id"
                                    class="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900"
                                >
                                    <div class="flex items-start justify-between">
                                        <div class="flex-1">
                                            <h4 class="font-medium text-zinc-900 dark:text-white">{{ marker.name }}</h4>
                                            <p class="text-sm text-zinc-600 dark:text-zinc-400">
                                                {{ formatCoordinate(marker.latitude) }},
                                                {{ formatCoordinate(marker.longitude) }}
                                            </p>
                                            <p v-if="marker.description" class="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                                                {{ marker.description }}
                                            </p>
                                        </div>
                                        <div class="ml-2 flex gap-1">
                                            <button
                                                @click="editMarker(marker)"
                                                class="rounded bg-zinc-700 px-2 py-1 text-xs text-white transition hover:bg-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                @click="openDeleteModal(marker)"
                                                class="rounded bg-black px-2 py-1 text-xs text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-300"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="areas.length > 0" class="space-y-2">
                            <h3 class="text-lg font-medium text-zinc-900 dark:text-white">Areas</h3>
                            <div class="space-y-2">
                                <div
                                    v-for="area in areas"
                                    :key="area.id"
                                    class="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900"
                                >
                                    <h4 class="font-medium text-zinc-900 dark:text-white">{{ area.name }}</h4>
                                    <p class="text-sm text-zinc-600 dark:text-zinc-400">
                                        {{ area.area.length }} points · centroid {{ area.centroid_latitude ? area.centroid_latitude.toFixed(6) : '—' }}, {{ area.centroid_longitude ? area.centroid_longitude.toFixed(6) : '—' }}
                                    </p>
                                    <p v-if="area.description" class="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                                        {{ area.description }}
                                    </p>
                                    <div class="mt-3 flex gap-2">
                                        <button
                                            @click="editArea(area)"
                                            class="rounded bg-zinc-700 px-3 py-1 text-xs text-white transition hover:bg-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            @click="openDeleteAreaModal(area)"
                                            class="rounded bg-black px-3 py-1 text-xs text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-300"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <!-- Delete confirmation modal (UI popup, not browser confirm()) -->
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

        <div class="relative z-[10001] w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h3 class="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                {{ deleteTargetArea ? 'Delete area' : 'Delete marker' }}
            </h3>

            <p class="text-sm text-zinc-700 dark:text-zinc-300">
                Are you sure you want to delete
                <span class="font-semibold">{{ deleteTargetArea ? deleteTargetArea.name : deleteTargetMarker?.name }}</span>?
            </p>

            <div v-if="deleteTargetMarker" class="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800">
                <div class="text-zinc-800 dark:text-zinc-200">
                    {{ formatCoordinate(deleteTargetMarker.latitude) }},
                    {{ formatCoordinate(deleteTargetMarker.longitude) }}
                </div>
                <div v-if="deleteTargetMarker.description" class="mt-1 text-zinc-600 dark:text-zinc-300">
                    {{ deleteTargetMarker.description }}
                </div>
            </div>

            <div v-if="deleteTargetArea" class="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800">
                <div class="text-zinc-800 dark:text-zinc-200">
                    {{ deleteTargetArea.area.length }} points · centroid {{ deleteTargetArea.centroid_latitude ? deleteTargetArea.centroid_latitude.toFixed(6) : '—' }}, {{ deleteTargetArea.centroid_longitude ? deleteTargetArea.centroid_longitude.toFixed(6) : '—' }}
                </div>
                <div v-if="deleteTargetArea.description" class="mt-1 text-zinc-600 dark:text-zinc-300">
                    {{ deleteTargetArea.description }}
                </div>
            </div>

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
                    @click="confirmDelete"
                    :disabled="deleteSubmitting"
                    class="flex-1 rounded-xl bg-black px-4 py-2 text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                    {{ deleteSubmitting ? 'Deleting...' : 'Delete' }}
                </button>
            </div>
        </div>
    </div>
</template>
