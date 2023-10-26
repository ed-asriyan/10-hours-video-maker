<script lang="ts">
    import type { FFmpeg } from '@ffmpeg/ffmpeg';
    import Loader from './loader.svelte';
    import {Video} from '../video';

    export let ffmpeg: FFmpeg;
    export let video: Video | null;
    export let disabled: boolean = false;

    let sourcePromise: Promise<Video>;
    const loadSource = async function (file): Promise<Video> {
        video = await Video.load({
            ffmpeg,
            name: file.name as string,
            uri: window.URL.createObjectURL(file) as string,
        });
    };
    let isLoading: boolean = false;

</script>

{#await sourcePromise}
    <Loader/>
{:then}
    <input disabled={disabled} type="file" on:change={({target: {files}}) => sourcePromise = loadSource(files[0])}/>
{:catch e}
    <input type="file" on:change={({target: {files}}) => sourcePromise = loadSource(files[0])}/>
    <div>Error: {e.toString()}</div>
{/await}    
