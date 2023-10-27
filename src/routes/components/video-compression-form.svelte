<script lang="ts" context="module">
    import type { Video } from '../video';
    export interface RenderConfig {
        video: Video;
        loopCount: number;
    }
</script>

<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { CompressType } from '../video';
    import VideoCompressionCard from './video-compression-card.svelte';

    const dispatch = createEventDispatcher();

    export let video: Video;
    export let loopCount: number;
    export let disabled: boolean = false;

    interface Options {
        name: string;
        compression: CompressType;
    }
    const options: Options[] = [
        {
            name: 'Original',
            compression: CompressType.original,
        }, {
            name: '480px',
            compression: CompressType.u420,
        }, {
            name: '240px',
            compression: CompressType.u240,
        }, {
            name: '140px',
            compression: CompressType.u140,
        }, {
            name: '64px',
            compression: CompressType.u64,
        },
    ];
</script>

<div class="video-selector">
    {#each options as option}
        <div class="video-item">
            <VideoCompressionCard 
                video={video}
                loopCount={loopCount}
                compression={option.compression}
                name={option.name}
                disabled={disabled}
                on:choose={() => dispatch('choose', { video })}
            />
        </div>
    {/each}
</div>

<style>
    .video-selector {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        & .video-item {
            margin: 1rem;
        }
    }
</style>
