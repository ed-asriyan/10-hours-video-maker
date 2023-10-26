<script lang="ts">
    import { slide } from 'svelte/transition';
    import { type FFmpeg } from '@ffmpeg/ffmpeg';
    import { Video } from './video';
    import VideoSelector from './components/video-selector.svelte';
    import VideoView from './components/video-view.svelte';
    import VideoSize from './components/video-size.svelte';
    import VideoCompressionForm, { type RenderConfig } from './components/video-compression-form.svelte';
    import Loader from './components/loader.svelte';

    export let ffmpeg: FFmpeg;

    let sourceVideo: Video | null = null;

    const render = async function (config: RenderConfig): Promise<Video> {    
        try {
            isRendering = true;
            return await config.video.loop(config.loopCount);
        } finally {
            isRendering = false;
        }
    }

    let isRendering: boolean = false;
    let renderingPromise: Promise<Video>;
</script>

<div class="center">
    <VideoSelector ffmpeg={ffmpeg} bind:video={sourceVideo} disabled={isRendering}/>
</div>

{#if sourceVideo !== null}
    <div transition:slide>
        <VideoCompressionForm 
            video={sourceVideo} 
            disabled={isRendering}
            on:choose={({ detail: config }) => renderingPromise = render(config)}
        />

        {#await renderingPromise}
            <Loader />
        {:then resultVideo}
            {#if resultVideo}
                <div>
                    <VideoView video={resultVideo}/>
                </div>
                <div>
                    <button on:click={() => resultVideo.download()}>Download</button>
                    <div>
                        <VideoSize video={resultVideo}/>
                    </div>
                </div>
            {/if}
        {/await}
    </div>
{/if}

<style>

</style>
