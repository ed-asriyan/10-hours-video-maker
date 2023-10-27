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
            name: '64px',
            compression: CompressType.u64,
        },{
            name: '140px',
            compression: CompressType.u140,
        }, {
            name: '240px',
            compression: CompressType.u240,
        }, {
            name: '480px',
            compression: CompressType.u420,
        },
    ];
</script>

<div class="uk-flex uk-flex-wrap uk-flex-center">
    {#each options as option}
        <div class="uk-margin-right uk-margin-bottom uk-flex-stretch">
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
