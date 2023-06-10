<script lang="ts">
    import type {Video} from './video';

    export let video: Video;
</script>

<video src={video.videoUri} controls></video>
