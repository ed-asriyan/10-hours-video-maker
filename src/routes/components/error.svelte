<script lang="ts">
    export let error: string;
</script>

<h1>Error occured :(</h1>
<button on:click={() => location.reload()} class="uk-button uk-button-default">Start over</button>
<div class="uk-text-danger margin-top center">{error}</div>
