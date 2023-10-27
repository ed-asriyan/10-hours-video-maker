<script lang="ts">
    import { createFFmpeg } from '@ffmpeg/ffmpeg';
    import { slide } from 'svelte/transition';
    import Title from './components/title.svelte';
    import Loader from './components/loader.svelte';
    import Form from './form.svelte';
    import Error from './components/error.svelte';
    import { parseTimeSpan } from './utils';
    import { seconds } from './store';

    const loadFfmpeg = async function () {
        const ffmpeg = createFFmpeg({log: true});
        await ffmpeg.load();
        ffmpeg.setLogger(({message}) => {
            const sec = parseTimeSpan(message);
            if (Number.isFinite(sec)) {
                seconds.set(sec);
            }
        })
        return ffmpeg;
    }

    let minutes: number = 600;
</script>

<div class="container uk-flex">
    <div class="content uk-flex uk-flex-column uk-flex-center uk-flex-middle">
        <div class="title uk-text-left">
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
            <div transition:slide>
                <Form ffmpeg={ffmpeg} bind:duration={minutes}/>
            </div>
        {:catch e}
        <div transition:slide class="uk-flex uk-flex-column uk-flex-middle">
            <Error error={e.toString()}/>
        </div>
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

    .container {
        min-height: 100vh;
        padding: 0 1rem;
        background-color: hsl(0, 0%, 96%);

        & .content {
            flex: 1;
        }
    }
</style>
