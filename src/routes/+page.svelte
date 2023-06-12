<script lang="ts">
    import {createFFmpeg} from '@ffmpeg/ffmpeg';
    import VideoSelector from './video-selector.svelte';

    let logs: string[] = [''];

    const ffmpeg = createFFmpeg({log: true});
    ffmpeg.setLogger(({message}) => {
        logs.push(message);
        logs = logs;
    })
    const fetchingFfmpeg = ffmpeg.load();
</script>

{#await fetchingFfmpeg}
    Loading...
{:then _}
    <VideoSelector ffmpeg="{ffmpeg}"/>

    <hr/>
    <div>{logs[logs.length - 1]}</div>
    <hr/>
    <div class="log">
        {#each logs as log}
            <div>{log}</div>
        {/each}
    </div>
{:catch e}
    Error :( {e}
{/await}

<style>
    .log {
        height: 100px;
        overflow-y: scroll;
    }
</style>
