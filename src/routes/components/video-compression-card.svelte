<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import VideoView from './video-view.svelte';
    import type { CompressType, Video } from '../video';
    import Loader from './loader.svelte';
    import { formatSize } from '../utils';
    import { slide } from 'svelte/transition';
    import storageLimit from '../storage-limit';

    const dispatch = createEventDispatcher();

    export let name: string;
    export let video: Video;
    export let compression: CompressType;
    export let loopCount: number;
    export let disabled: boolean = false;
</script>

<div class="uk-card uk-card-body uk-card-default uk-card-hover">
    <h4 class="uk-heading-divider">{name}</h4>
    {#await video.compress(compression)}
        <div transition:slide>
            <Loader/>
        </div>   
    {:then compressedVideo}
        <div transition:slide class="video uk-margin-bottom">
            <VideoView video={compressedVideo}/>
        </div>
        <div transition:slide class="uk-margin-top">
            <button on:click={() => dispatch('choose', { video: compressedVideo })} class="uk-button uk-button-default" disabled={disabled}>
                {#if compressedVideo.size * loopCount > storageLimit}
                    (!)
                {/if}
                Render (~{formatSize(compressedVideo.size * loopCount)})
            </button>
        </div>
    {/await}
</div>
