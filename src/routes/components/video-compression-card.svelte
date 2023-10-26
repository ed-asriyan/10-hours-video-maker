<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import VideoSize from './video-size.svelte';
    import VideoView from './video-view.svelte';
    import type { CompressType, Video } from '../video';
    import Loader from './loader.svelte';

    const dispatch = createEventDispatcher();

    export let name: string;
    export let video: Video;
    export let compression: CompressType;
    export let loopCount: number;
    export let disabled: boolean = false;

    const onChoose = function(video: Video) {
        dispatch('choose', { video });
    };
</script>

<div class="container">
    <div class="title">Type: {name}</div>
    {#await video.compress(compression)}
        <Loader/>
    {:then compressedVideo} 
    <div class="video">
        <VideoView video={compressedVideo}/>
    </div>
    <div class="size">
        <VideoSize video={compressedVideo} loopCount={loopCount}/>
    </div>
    <div>
        <button on:click={() => onChoose(compressedVideo)} disabled={disabled}>Choose</button>
    </div>
    {/await}
</div>

<style lang="scss">
    .container {
        background-color: white;
        border: snow 0.5px solid;
        text-align: center;
        padding: 1rem;
        margin: 1rem;
        border-radius: 3px;
        transition: box-shadow 100ms ease-in-out;

        &:hover {
            box-shadow: 4px 4px 7px gray;
        }

        & .title {
            font-weight: bold;
        }

        & .video {
            text-align: center;
            width: 250px;
            margin: 5px;
            padding: 5px;
            border: transparent solid 1px;
        }

        & .size {
            font-weight: lighter;
        }
    }
</style>
