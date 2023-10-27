<script lang="ts">
    import { onDestroy } from 'svelte';
    import { linear } from 'svelte/easing';
    import { tweened } from 'svelte/motion';

    export let max: number;
    export let value: number;

    const progress = tweened(0, {
		duration: 500,
		easing: linear
	});

    $: progress.set(value);
</script>

<progress class="uk-progress" value={$progress} max={max}></progress>

<style lang="scss">
    progress {
        background-color: lightgray !important;
    }
</style>