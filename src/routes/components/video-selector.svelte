<script lang="ts">
    import type { FFmpeg } from '@ffmpeg/ffmpeg';
    import Loader from './loader.svelte';
    import { Video } from '../video';
    import { slide } from 'svelte/transition';

    export let ffmpeg: FFmpeg;
    export let video: Video | null;
    export let disabled: boolean = false;

    let input: HTMLInputElement;

    let sourcePromise: Promise<Video>;
    const loadSource = async function (file: any): Promise<void> {
        video = null;
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            video = await Video.load({
                ffmpeg,
                name: file.name as string,
                uri: window.URL.createObjectURL(file) as string,
            });
        } catch (e) {
            alert(`Error while loading the video:\n${e}`);
            
        }
    };
</script>

<input bind:this={input} type="file" on:change={({target: {files}}) => loadSource(files[0])}/>
{#await sourcePromise}
    <Loader/>
{:then}
    <span transition:slide>
        <button on:click={() => input.click()} class={video ? 'uk-button uk-button-secondary' : 'uk-button uk-button-default'} disabled={disabled}><slot/></button>
    </span>
{/await}

<style lang="scss">
    input {
        display: none;
    }
</style>
