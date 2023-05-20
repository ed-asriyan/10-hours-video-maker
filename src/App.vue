<script setup lang="ts">
import {ref, computed, reactive} from 'vue'
import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg'
import {Video, VideoProperties} from '@/video';
import {formatDuration, formatSize} from './utils';

const progress = ref<number>(0)
const messageLog = ref<string>('')
const loopCount = ref<number>(0);

const loaders = reactive({
  init: true,
  compressing: false,
  sourceProperties: false,
  rendering: false,

  any: computed(() => loaders.compressing || loaders.init || loaders.rendering),
});

let sourceVideo: Video | null = null;
let sourceVideoProperties: VideoProperties | null = null;
let resultVideo: Video | null = null;

const ffmpeg = createFFmpeg({log: true});
ffmpeg.setProgress(({ratio}) => {
  progress.value = ratio;
})
ffmpeg.setLogger(({message}) => {
  messageLog.value = message;
})
ffmpeg.load().then(() => loaders.init = false);

const loadVideo = async ({target: {files}}) => {
  const file = files[0]
  const fileUrl = window.URL.createObjectURL(file);

  resultVideo = null;
  sourceVideo = null;
  sourceVideoProperties = null;

  loaders.compressing = true;
  try {
    const video = new Video(ffmpeg, file.name, fileUrl);
    const sourceProperties = await VideoProperties.load(video);

    const compressedVideo = await video.compress();
    const compressedProperties = await VideoProperties.load(compressedVideo);

    if (sourceProperties.size < compressedProperties.size) {
      sourceVideo = video;
      sourceVideoProperties = sourceProperties;
    } else {
      sourceVideo = compressedVideo;
      sourceVideoProperties = compressedProperties;
    }
  } catch (e) {
    console.error(e);
    alert(e.toString());
    sourceVideo = null;
    return;
  } finally {
    loaders.compressing = false;
  }

  loopCount.value = Math.ceil(36000 / sourceVideoProperties?.duration) + 1;
}

const run = async () => {
  loaders.rendering = true;
  try {
    resultVideo = await sourceVideo?.loop(loopCount.value);
  } catch (e) {
    console.error(e);
    alert(e.toString());
    return;
  } finally {
    loaders.rendering = false;
  }
}

const download = function () {
  resultVideo?.download();
}

</script>

<template>
  <div class="header" v-if="!loaders.init">
    <input type="file" :disabled="loaders.any" @change="loadVideo"/>
    <template v-if="loaders.compressing">
      <div>Compressing source video...</div>
    </template>
    <template v-else-if="sourceVideo">
      <video
          :src="sourceVideo.videoUri"
          controls
      />
    </template>

    <template v-if="loaders.sourceProperties">
      <div>Loading properties...</div>
    </template>
    <template v-else-if="sourceVideoProperties">
      <label>Duration: {{ formatDuration(sourceVideoProperties.duration) }}</label>
      <label>Size: {{ formatSize(sourceVideoProperties.size) }}</label>
      <hr style="width: 100%"/>
      <label>Loop count</label>
      <input type="number" v-model="loopCount"/>

      <label>Duration: {{ formatDuration(sourceVideoProperties?.duration * loopCount) }}</label>
      <label>Approximate size: {{ formatSize(sourceVideoProperties?.size * loopCount) }}</label>
      <div v-if="sourceVideoProperties?.size * loopCount > 1024 * 1024 * 1024 * 3">
        <label style="color: red">File is quite big. Processing may fail</label>
      </div>

      <button :disabled="loaders.any" @click="run">Run</button>
    </template>

    <template v-if="loaders.rendering">
      <label v-if="loaders.any">Wait, rendering...</label>
      <label v-if="loaders.any">{{ messageLog }}</label>
    </template>
    <template v-else-if="resultVideo">
      <hr style="width: 100%"/>

      <video class="block" :src="resultVideo.videoUri" controls/>
      <button @click="download">Download</button>
    </template>
  </div>
  <div v-else>Loading</div>
</template>

<style scoped>
.header {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-content: center;
  justify-items: center;
  max-width: 512px;
}
</style>
