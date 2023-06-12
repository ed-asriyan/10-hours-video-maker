<script lang="ts">
    import {Video, VideoProperties} from './video';
    import {formatSize} from './utils';

    export let video: Video;
    export let loopCount: number = 1;

    const getProperties = function (video: Video): Promise<VideoProperties> {
        return VideoProperties.load(video);
    };
</script>

Size:
{#await getProperties(video)}
    <i>loading...</i>
{:then properties}
    {formatSize(properties.size * loopCount)}
{:catch e}
    <i>Error getting video properties</i>
{/await}
