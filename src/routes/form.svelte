<script lang="ts">
    import { slide } from 'svelte/transition';
    import type { FFmpeg } from '@ffmpeg/ffmpeg';
    import type { Video } from './video';
    import VideoSelector from './components/video-selector.svelte';
    import VideoView from './components/video-view.svelte';
    import VideoCompressionForm, { type RenderConfig } from './components/video-compression-form.svelte';
    import DurationSelector from './components/duration-selector.svelte';
    import { formatDuration, formatSize } from './utils';
    import storageLimit from './storage-limit';
    import Error from './components/error.svelte';
    import { seconds } from './store';
    import Progress from './components/progress.svelte';

    export let ffmpeg: FFmpeg;
    export let duration: number = 600;

    let sourceVideo: Video | null = null;

    $: targetDuration = duration * 60;
    $: targetLoopCount = sourceVideo ? Math.ceil(targetDuration / sourceVideo.duration) : 0;

    const render = async function (video: Video, loopCount: number): Promise<Video> {  
        try {
            isRendering = true;
            return await video.loop(loopCount);
        } finally {
            isRendering = false;
        }
    };

    let isRendering: boolean = false;
    let renderingPromise: Promise<Video>;
</script>

{#if !renderingPromise}
    <div class="uk-flex uk-flex-column uk-flex-middle">
        <div>
            <h3>1. Select video</h3>
            <div class="uk-margin">
                Video you select are being processed locally in your browser.<br/>It's not being uploaded to any remote servers.
            </div>
            <div class="uk-form-controls uk-margin-bottom">
            <VideoSelector ffmpeg={ffmpeg} bind:video={sourceVideo} disabled={isRendering}>
                {#if sourceVideo}
                    Select another video
                {:else}
                    Select video
                {/if}
            </VideoSelector>
            {#if sourceVideo}
                <span transition:slide class="uk-padding-left">{sourceVideo.name}</span>
            {/if}
            </div>
            {#if sourceVideo !== null}
                <h3 class="uk-margin-large-top">2. Select result duration</h3>
                <DurationSelector bind:duration={duration}/>
                <h3 class="uk-margin-large-top">3. Select compression type</h3>
                <div class="uk-margin">
                    Your brower's limitation is {formatSize(storageLimit)} for output video.
                </div>
            {/if}
        </div>

        {#if sourceVideo !== null}
            <div transition:slide>
                <VideoCompressionForm 
                    video={sourceVideo} 
                    disabled={isRendering || !duration}
                    loopCount={targetLoopCount}
                    on:choose={({ detail: { video } }) => renderingPromise = render(video, targetLoopCount)}
                />
            </div>
        {/if}
    </div>
{:else}
    {#await renderingPromise}
        <div class="uk-text-center" transition:slide>
            <Progress value={$seconds} max={sourceVideo.duration * targetLoopCount}/>
            <b>{formatDuration($seconds / 60)}</b> of <b>{formatDuration(sourceVideo.duration * targetLoopCount / 60)}</b> is done
            <br>
            Do not close this tab and browser. 
            <div class="uk-margin-top">
                <button on:click={() => location.reload()} class="uk-button uk-button-default">Cancel</button>
            </div>
        </div>
    {:then resultVideo}
        <div class="uk-text-center" transition:slide>
            <div>
                <VideoView video={resultVideo}/>
            </div>
            <div class="uk-margin-top">
                <button on:click={() => resultVideo.download()} class="uk-button uk-button-secondary">Download ({formatSize(resultVideo.size)})</button>
            </div>
            <div class="uk-margin-top">
                <button on:click={() => location.reload()} class="uk-button uk-button-default">Render another video</button>
            </div>
        </div>
    {:catch e}
        <Error error={e.toString()}/>
    {/await}
{/if}
