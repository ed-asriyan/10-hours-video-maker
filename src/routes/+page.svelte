<script lang="ts">
    import {createFFmpeg} from '@ffmpeg/ffmpeg';
    import VideoSelector from './video-selector.svelte';

    let logs: string[] = [''];

    const loadFfmpeg = async function () {
        const ffmpeg = createFFmpeg({log: true});
        ffmpeg.setLogger(({message}) => {
            logs.push(message);
            logs = logs;
        })
        await ffmpeg.load();
        return ffmpeg;
    }
</script>

{#await loadFfmpeg()}
    Loading webassembly...
{:then ffmpeg}
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
