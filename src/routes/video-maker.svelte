<script lang="ts">
    import VideoView from './video-view.svelte';
    import type {Properties, Video} from './video';
    import {VideoProperties} from './video';
    import {formatSize} from './utils';
    import storageLimit from './storage-limit';

    export let video: Video;
    export let properties: VideoProperties;

    let targetDurationMinutes: number = 600;

    $: targetDuration = targetDurationMinutes * 60;
    $: targetLoopCount = Math.ceil(targetDuration / properties.duration);

    $: forecastProperties = {
        size: properties.size * targetLoopCount,
        duration: properties.duration * targetLoopCount
    } as Properties;

    let result: Promise<Video>;
    const make = async function (video: Video, loopCount: number) {
        return await video.loop(loopCount);
    };

    const download = function (video: Video) {
        video.download();
    };
</script>

<div>Duration (minutes): <input type="number" bind:value={targetDurationMinutes} min="0"/></div>
<br/>
<div>Size forecast: {formatSize(forecastProperties.size)}.</div>
{#if forecastProperties.size > storageLimit}
    <div style="color: red">
        Conversion will fail since it exceeds your browser storage size: {Math.round(storageLimit / 1024 / 1024)}Mb.
    </div>
{/if}
<button on:click={() => result = make(video, targetLoopCount)}>Run!</button>

{#if result}
    {#await result}
        Running...
    {:then resultVideo}
        <div>
            <VideoView video={resultVideo}/>
        </div>
        <div>
            <button on:click={() => download(resultVideo)}>Download</button>
            {#await VideoProperties.load(resultVideo)}
            {:then resultVideoProperties}
                <span>Size: {formatSize(resultVideoProperties.size)}</span>
            {/await}
        </div>
    {:catch e}
        {e}
    {/await}
{/if}
