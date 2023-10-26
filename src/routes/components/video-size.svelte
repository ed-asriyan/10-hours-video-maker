<script lang="ts">
    import type {Video} from '../video';
    import {formatSize} from '../utils';

    export let video: Video;
    export let loopCount: number = 1;
</script>

{formatSize(video.size * loopCount)}
