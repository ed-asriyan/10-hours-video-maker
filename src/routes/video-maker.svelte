<script lang="ts">
    import VideoView from './video-view.svelte';
    import type {Properties, Video, VideoProperties} from './video';
    import {formatDuration, formatSize} from './utils';

    export let video: Video;
    export let properties: VideoProperties;

    let loopCount: number = Math.ceil(36000 / properties?.duration) + 1;
    $: resultProperties = {
        size: properties.size * loopCount,
        duration: properties.duration * loopCount
    } as Properties;

    let result: Promise<Video>;
    const make = function (video: Video, loopCount: number) {
        return video?.loop(loopCount);
    };

    const download = function (video: Video) {
        video.download();
    };
</script>

<div>Loop count: <input type="number" bind:value={loopCount} min="0"/></div>
<div>Duration: {formatDuration(resultProperties.duration)}</div>
<div>Size: {formatSize(resultProperties.size)}</div>

<button on:click={() => result = make(video, loopCount)}>Run!</button>

{#if result}
    {#await result}
        Running
    {:then r}
        <div><VideoView video={r}/></div>
        <div><button on:click={() => download(r)}>Download</button></div>
    {:catch e}
        {e}
    {/await}
{/if}
