import type {FFmpeg} from '@ffmpeg/ffmpeg';
import {fetchFile} from '@ffmpeg/ffmpeg';
import {saveAs} from 'file-saver';

let i = 0;

let isRunning = false;

export enum CompressType {
    'u420',
    'u240',
    'u140',
    'u64',
}

const sleep = function (ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const compress: {[x in CompressType]: string[]} = {
    [CompressType.u64]: [
        '-vf', 'scale=64:-2,setsar=1:1',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
    ],
    [CompressType.u140]: [
        '-vf', 'scale=140:-2,setsar=1:1',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
    ],
    [CompressType.u240]: [
        '-vf', 'scale=240:-2,setsar=1:1',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
    ],
    [CompressType.u420]: [
        '-vf', 'scale=420:-2,setsar=1:1',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
    ],
};

export class Video {
    private readonly ffmpeg: FFmpeg;
    private readonly name: string;
    readonly videoUri: string

    constructor(ffmpeg: FFmpeg, name: string, videoUri: string) {
        this.ffmpeg = ffmpeg;
        this.name = name;
        this.videoUri = videoUri;
    }

    async loop(loopCount: number): Promise<Video> {
        const fsSourceName = `${++i} ${this.name}`;
        const fsDistName = `${++i} ${this.name}`;

        if (isRunning) {
            await sleep(1000);
            return this.loop(loopCount);
        }
        isRunning = true;

        try {
            this.ffmpeg.FS('writeFile', fsSourceName, await fetchFile(this.videoUri));
            await this.ffmpeg.run(
                '-stream_loop',
                (loopCount - 1).toString(),
                '-i',
                fsSourceName,
                // '-c:v', 'libx264',
                // '-crf', '18',
                // '-preset', 'veryslow',
                '-c:a',
                'copy',
                '-c:v',
                'copy',
                fsDistName,
            );
            const data = this.ffmpeg.FS('readFile', fsDistName);
            return new Video(this.ffmpeg, this.name, URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'})));
        } finally {
            isRunning = false;
            this.ffmpeg.FS('unlink', fsSourceName);
            this.ffmpeg.FS('unlink', fsDistName);
        }
    }

    async compress(type: CompressType): Promise<Video> {
        const fsSourceName = `${++i} ${this.name}`;
        const fsDistName = `${++i} ${this.name}`;

        if (isRunning) {
            await sleep(1000);
            return this.compress(type);
        }
        isRunning = true;

        try {
            this.ffmpeg.FS('writeFile', fsSourceName, await fetchFile(this.videoUri));
            await this.ffmpeg.run(
                '-i',
                fsSourceName,
                ...compress[type],
                fsDistName,
            );

            const data = this.ffmpeg.FS('readFile', fsDistName);
            return new Video(this.ffmpeg, this.name, URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'})));
        } finally {
            isRunning = false;
            this.ffmpeg.FS('unlink', fsSourceName);
            this.ffmpeg.FS('unlink', fsDistName);
        }
    }

    download() {
        // @ts-ignore
        saveAs(this.videoUri, this.name, 'video/mp4');
    }
}

export interface Properties {
    duration: number;
    size: number;
}

export class VideoProperties implements Properties {
    private readonly video: Video;
    duration: number = NaN;
    size: number = NaN;

    private constructor(video: Video) {
        this.video = video;
    }

    private async load() {
        this.duration = await this.loadDuration();
        this.size = await this.loadSize();
    }

    private async loadDuration(): Promise<number> {
        const el = document.createElement('video');
        el.setAttribute('src', this.video.videoUri);
        return new Promise((resolve, reject) => {
            el.addEventListener('loadedmetadata', ({target: {duration}}) => resolve(duration));
            el.addEventListener('error', reject);
        });
    }

    private async loadSize(): Promise<number> {
        const blob = await fetch(this.video.videoUri).then(r => r.blob());
        return blob.size;
    }

    static async load(video: Video): Promise<VideoProperties> {
        const result = new VideoProperties(video);
        await result.load();
        return result;
    }
}
