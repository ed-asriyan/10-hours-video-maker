<script lang="ts">
    import { formatDuration } from '../utils';

    export let minutes: number;
</script>

<h1 class="uk-heading-large">{ minutes ? formatDuration(minutes) : 'Not a'} video maker</h1>
