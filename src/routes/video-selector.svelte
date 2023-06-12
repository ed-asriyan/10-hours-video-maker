<script lang="ts" context="module">
    import type {Video, VideoProperties} from './video';
    import VideoMaker from './video-maker.svelte';

    export type Source = {
        video: Video;
        properties: VideoProperties;
    };
</script>

<script lang="ts">
    import {Video, VideoProperties} from './video';

    export let ffmpeg;

    let source: Promise<Source>;
    const loadSource = async function (file): Promise<Source> {
        const fileUrl = window.URL.createObjectURL(file);

        const video = new Video(ffmpeg, file.name, fileUrl);
        const properties = await VideoProperties.load(video);

        return {
            video,
            properties,
        };
    };

</script>

<input type="file" on:change={({target: {files}}) => source = loadSource(files[0])}/>
{#if source}
    <hr/>
    {#await source}
        <div>Loading...</div>
    {:then source}
        <div>
            <VideoMaker video={source.video} properties={source.properties}/>
        </div>
    {:catch e}
        <div>{e}</div>
    {/await}
{/if}
