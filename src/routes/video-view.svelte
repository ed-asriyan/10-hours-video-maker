<script lang="ts">
    import type {Video} from './video';

    export let video: Video;
</script>

<video class="video" src={video.videoUri} controls></video>

<style>
    .video {
        height: 200px;
    }
</style>
