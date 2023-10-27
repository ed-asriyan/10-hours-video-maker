<script lang="ts">
    import { formatDuration } from '../utils';

    export let minutes: number;

    $: title = `${ minutes ? formatDuration(minutes) : 'Not a'} video maker`;
</script>

<svelte:head>
    <title>{ title }</title> 
</svelte:head>

<h1 class="uk-heading-large">{ title }</h1>
