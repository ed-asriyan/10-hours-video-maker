<script lang="ts">
    import {createFFmpeg} from '@ffmpeg/ffmpeg';
    import VideoSelector from './video-selector.svelte';

    let messageLog: string;

    const ffmpeg = createFFmpeg({log: true});
    ffmpeg.setLogger(({message}) => {
        messageLog = message;
    })
    const fetchingFfmpeg = ffmpeg.load();
</script>

{#await fetchingFfmpeg}
    Loading...
{:then _}
    <VideoSelector ffmpeg="{ffmpeg}"/>

    <hr/>

    <div>
        {messageLog}
    </div>
{:catch e}
    Error :( {e}
{/await}
