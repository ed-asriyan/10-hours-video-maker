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
    import VideoView from './video-view.svelte';

    export let ffmpeg;

    let source: Promise<Source>;
    const loadSource = async function (file): Promise<Source> {
        const fileUrl = window.URL.createObjectURL(file);

        let video = new Video(ffmpeg, file.name, fileUrl);
        let properties = await VideoProperties.load(video);

        const compressedVideo = await video.compress();
        const compressedProperties = await VideoProperties.load(compressedVideo);

        if (compressedProperties.size < properties.size) {
            video = compressedVideo;
            properties = compressedProperties;
        }

        return {
            video,
            properties,
        };
    };

</script>

<input type="file" on:change={({target: {files}}) => source = loadSource(files[0])}/>
{#if source}
    {#await source}
        <div>loading</div>
    {:then source}
        <div>
            <VideoView video={source.video}/>
        </div>
        <hr/>
        <div>
            <VideoMaker video={source.video} properties={source.properties}/>
        </div>
    {:catch e}
        <div>{e}</div>
    {/await}
{/if}
