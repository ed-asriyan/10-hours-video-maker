<script lang="ts">
    import type {Video} from '../video';

    export let video: Video;
</script>

<video class="video" src={video.videoUri} controls></video>

<style>
    .video {
        max-height: 20rem;
        width: 100%;
    }
</style>
