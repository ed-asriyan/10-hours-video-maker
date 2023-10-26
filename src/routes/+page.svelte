<script lang="ts">
    import { slide } from 'svelte/transition';
    import { createFFmpeg } from '@ffmpeg/ffmpeg';
    import Title from './components/title.svelte';
    import Loader from './components/loader.svelte';
    import Form from './form.svelte';

    const loadFfmpeg = async function () {
        const ffmpeg = createFFmpeg({log: true});
        await ffmpeg.load();
        return ffmpeg;
    }

    let minutes: number = 60;
</script>

<div class="container flex">
    <div class="content flex flex-center">
        <div class="title">
            <Title minutes={minutes}/>
        </div>
        {#await loadFfmpeg()}
            <div transition:slide>
                <Loader/>
            </div>
        {:then ffmpeg}
            <div transition:slide>
                <Form ffmpeg={ffmpeg}/>
            </div>
        {:catch e}
            Error :( {e}
        {/await}
    </div>
</div>

<style lang="scss">
    $title-height: 5rem;

    :global(html, body) {
        margin: 0;
        padding: 0;
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
        background-color: #c3c3c3;

        & .title {
            margin-top: -2 * $title-height;
            margin-bottom: $title-height;
        }

        & .content {
            flex: 1;
        }
    }
</style>
