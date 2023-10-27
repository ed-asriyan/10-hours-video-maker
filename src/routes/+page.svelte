<script lang="ts">
    import { createFFmpeg } from '@ffmpeg/ffmpeg';
    import { slide } from 'svelte/transition';
    import Title from './components/title.svelte';
    import Loader from './components/loader.svelte';
    import Form from './form.svelte';
    import Error from './components/error.svelte';

    const loadFfmpeg = async function () {
        const ffmpeg = createFFmpeg({log: true});
        await ffmpeg.load();
        return ffmpeg;
    }

    let minutes: number = 600;
</script>

<div class="container flex">
    <div class="content flex flex-center">
        <div class="title center">
            <Title minutes={minutes}/>
            <hr class="uk-divider-icon">
        </div>
        {#await loadFfmpeg()}
            <div transition:slide>
                <Loader>
                    Loading webassembly...
                    <br/>
                    It may take up to 10 seconds
                </Loader>
            </div>
        {:then ffmpeg}
            <Form ffmpeg={ffmpeg} bind:duration={minutes}/>
        {:catch e}
            <Error error={e.toString()}/>
        {/await}
    </div>
</div>

<style lang="scss">
    $title-height: 5rem;

    :global(html, body) {
        margin: 0;
        padding: 0;
        overflow-y: scroll;
        min-height: 100hv;
    }

    .flex {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .flex-center {
        justify-content: center;
    }

    .container {
        min-height: 100vh;
        padding: 0;
        margin: 0;
        background-color: hsl(0, 0%, 96%);

        & .title {
            margin-bottom: 1rem;
        }

        & .content {
            flex: 1;
        }
    }
</style>
