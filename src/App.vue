<script setup lang="ts">
import {ref, computed, reactive} from 'vue'
import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg'
import {saveAs} from 'file-saver'

const ffmpeg = createFFmpeg({log: true})
ffmpeg.setProgress(({ratio}) => {
  progress.value = ratio
})
ffmpeg.setLogger(({message}) => {
  messageLog.value = message
})

const progress = ref<number>(0)
const messageLog = ref<string>('')

const formatDuration = (ms) => {
  // https://www.30secondsofcode.org/js/s/format-duration/
  if (ms < 0) ms = -ms
  const time = {
    hour: Math.floor(ms / 3600) % 24,
    minute: Math.floor(ms / 60) % 60,
    second: Math.floor(ms) % 60,
    millisecond: Math.floor((ms - Math.floor(ms)) * 1000)
  }
  return Object.entries(time)
      .filter((val) => val[1] !== 0)
      .map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
      .join(', ')
}
const formatSize = (fileSizeInBytes) => {
  let i = -1
  const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
  do {
    fileSizeInBytes /= 1024
    i++
  } while (fileSizeInBytes > 1024)

  return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
}

const sourceVideo = reactive({
  name: ref<string | null>(null),
  url: ref<string | null>(null),
  duration: ref<number | null>(null),
  size: ref<number | null>(null),

  isLoaded: computed(
      () => sourceVideo.duration !== null && sourceVideo.url !== null && sourceVideo.duration !== null
  ),
  reset() {
    sourceVideo.name = null
    sourceVideo.url = null
    sourceVideo.duration = null
  }
})

const resultVideo = reactive({
  url: ref<string | null>(null),
  loopCount: ref<number | null>(null),
  size: computed(() => sourceVideo.size * resultVideo.loopCount * 1.1),
  duration: computed({
    get() {
      return sourceVideo.duration * resultVideo.loopCount
    },
    set(value: number) {
      resultVideo.loopCount = Math.ceil(value / sourceVideo.duration)
    }
  }),
  isRunning: ref<boolean>(false),

  isLoaded: computed(() => resultVideo.url !== null),
  reset() {
    resultVideo.url = null
    resultVideo.loopCount = null
  }
})

const loadVideo = async ({target: {files}}) => {
  sourceVideo.reset()
  resultVideo.reset()

  const file = files[0]
  console.log(file)
  sourceVideo.url = window.URL.createObjectURL(file)
  sourceVideo.name = file.name
  sourceVideo.size = file.size
  try {
    ffmpeg.isLoaded() || (await ffmpeg.load())
  } catch (e) {
    alert(e.toString())
    console.error(e)
    sourceVideo.reset()
    return
  }
  ffmpeg.FS('writeFile', sourceVideo.name, await fetchFile(file))
}

const fillDuration = ({target: {duration}}) => {
  sourceVideo.duration = duration
  resultVideo.duration = 10 * 3600
  ++resultVideo.loopCount
}

const run = async () => {
  resultVideo.isRunning = true
  try {
    await ffmpeg.run(
        '-stream_loop',
        resultVideo.loopCount.toString(),
        '-i',
        sourceVideo.name,
        // '-c:v', 'libx264',
        // '-crf', '18',
        // '-preset', 'veryslow',
        '-c:a',
        'copy',
        '-c:v',
        'copy',
        'output.mp4'
    )
  } catch (e) {
    alert(e.toString())
    console.error(e)
    return
  } finally {
    resultVideo.isRunning = false
  }
  const data = ffmpeg.FS('readFile', 'output.mp4')
  resultVideo.url = URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'}))
}

const download = function () {
  saveAs(resultVideo.url, `10 hours ${sourceVideo.name}`, 'video/mp4')
}
</script>

<template>
  <div class="header">
    <input type="file" :disabled="resultVideo.isRunning" @change="loadVideo"/>
    <template v-if="sourceVideo.url">
      <video
          class="block"
          :src="sourceVideo.url"
          @loadedmetadata="fillDuration"
          @durationchange="fillDuration"
          controls
      />
      <label>Duration: {{ formatDuration(sourceVideo.duration) }}</label>
      <label>Size: {{ formatSize(sourceVideo.size) }}</label>
      <div v-if="resultVideo.size > 1024 * 1024 * 1024 * 3">
        <label style="color: red">File is quite big. Processing may fail</label>
      </div>
    </template>
    <template v-if="sourceVideo.isLoaded">
      <hr style="width: 100%"/>
      <label>Loop count</label>
      <input type="number" v-model="resultVideo.loopCount"/>

      <label>Duration: {{ formatDuration(resultVideo.duration) }}</label>
      <label>Approximate size: {{ formatSize(resultVideo.size) }}</label>
      <button :disabled="resultVideo.isRunning" @click="run">Run</button>
      <label v-if="resultVideo.isRunning">Wait, rendering...</label>
      <label v-if="resultVideo.isRunning">{{ messageLog }}</label>
    </template>
    <template v-if="resultVideo.isLoaded && sourceVideo.isLoaded">
      <hr style="width: 100%"/>

      <video class="block" :src="resultVideo.url" controls/>
      <button @click="download">Download</button>
    </template>
  </div>
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
