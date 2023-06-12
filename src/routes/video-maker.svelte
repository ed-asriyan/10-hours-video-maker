<script lang="ts">
    import VideoView from './video-view.svelte';
    import VideoSize from './video-size.svelte';
    import {VideoProperties, Video, CompressType} from './video';

    export let video: Video;
    export let properties: VideoProperties;

    let targetDurationMinutes: number = 600;
    $: targetDuration = targetDurationMinutes * 60;
    $: targetLoopCount = Math.ceil(targetDuration / properties.duration);

    const compress = function (type: CompressType): Promise<Video> {
        return video.compress(type);
    };

    const types = {
        '480px': CompressType.u420,
        '240px': CompressType.u240,
        '140px': CompressType.u140,
        '64px': CompressType.u64,
    };

    const videoTypes: { name: string, video: Promise<Video> }[] = [{
        name: 'Original',
        video: new Promise(resolve => resolve(video)) as Promise<Video>,
    }].concat(Object.entries(types).map(([name, type]) => ({
        name,
        video: compress(type),
    })));

    let videoToLoopIndex = 0;
    let result: Promise<Video>;
    const make = async function (video: Video, loopCount: number) {
        return await video.loop(loopCount);
    };

    const download = function (video: Video) {
        video.download();
    };
</script>

<div>Duration (minutes): <input type="number" bind:value={targetDurationMinutes} min="0"/></div>
<div class="video-selector">
    {#each videoTypes as type, i}
        <div class="video-item" class:selected={videoToLoopIndex === i}>
            <div class="video-item-title">{type.name}</div>
            <div class="video">
                {#await type.video}
                    Compressing...
                {:then video}
                    <div>
                        <VideoView video={video}/>
                    </div>
                    <div>
                        <VideoSize video={video} loopCount={targetLoopCount}/>
                    </div>
                    <div>
                        {#if videoToLoopIndex === i}
                            <button disabled>Selected</button>
                        {:else}
                            <button on:click={() => videoToLoopIndex = i}>Select</button>
                        {/if}
                    </div>
                {:catch e}
                    Error {e}
                {/await}
            </div>
        </div>
    {/each}
</div>
<hr/>

<button on:click={async () => result = make(await videoTypes[videoToLoopIndex].video, targetLoopCount)}>Run!</button>

{#if result}
    {#await result}
        Running...
    {:then resultVideo}
        <div>
            <VideoView video={resultVideo}/>
        </div>
        <div>
            <button on:click={() => download(resultVideo)}>Download</button>
            <div>
                <VideoSize video={resultVideo}/>
            </div>
        </div>
    {:catch e}
        {e}
    {/await}
{/if}

<style>
    .video-selector {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .video-item {
        text-align: center;
        width: 250px;
        margin: 5px;
        padding: 5px;
        border: transparent solid 1px;
    }

    .video-item.selected {
        border: black solid 1px;
        border-radius: 5px;
    }

    .video-item button {
        margin-top: 5px;
    }

    .video-item-title {
        font-weight: bold;
    }
</style>
