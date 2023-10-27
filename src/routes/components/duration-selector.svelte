<script lang="ts">
    export let duration: number = 600;

    const options = [
        {
            title: '10 minutes',
            value: 10,
        },
        {
            title: '30 minutes',
            value: 30,
        },
        {
            title: '1 hour',
            value: 60,
        }, {
            title: '10 hours',
            value: 600,
        },
    ];

    let isCustom: boolean = false;

    const click = function(option: typeof options[0]) {
        duration = option.value;
        isCustom = false;
    };
</script>

<div class="uk-flex uk-flex-wrap">
    {#each options as option}
        <div class="uk-margin-right uk-margin-bottom uk-flex-stretch">
            <button on:click={() => click(option)} class={duration === option.value ? 'uk-button uk-button-secondary' : 'uk-button uk-button-default'}>{option.title}</button>
        </div>
    {/each}
    <span class="{!duration ? 'uk-form-danger' : ''} uk-margin-right uk-margin-bottom">
        {#if isCustom}
            <input type="number" bind:value={duration} class="uk-input uk-form-width-small custom {!duration ? 'uk-form-danger' : ''}" min="0" placeholder="Minutes" />
            <span class="custom-label">
                ← Enter minutes
                {#if !duration}
                    or click a button
                {/if}
            </span>
        {:else}
            <button on:click={() => isCustom = true} class="uk-button uk-button-default">Custom</button>
        {/if}
    </span>
</div>

<style lang="scss">
    .custom {
        width: 122px;

        &-label {
            position: absolute;
            line-height: 2.5rem;
        }
    }
</style>