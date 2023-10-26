<script lang="ts">
    export let minutes: number;

    $: hours = Math.round(minutes / 60);
    $: title = `${hours} hour${hours === 1 ? '' : 's'} video maker`;
</script>

<div class="title">{ title }</div>

<style lang="scss">
    .title {
        font-size: 5rem;
    }
</style>