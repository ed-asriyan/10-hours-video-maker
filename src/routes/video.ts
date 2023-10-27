import type {FFmpeg} from '@ffmpeg/ffmpeg';
import {fetchFile} from '@ffmpeg/ffmpeg';
import {saveAs} from 'file-saver';

let i = 0;

let isRunning = false;

export enum CompressType {
    original,
    u420,
    u240,
    u140,
    u64,
}

const sleep = function (ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const compress: {[x in CompressType]: string[]} = {
    [CompressType.original]: [],
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

export interface VideoConstructorOptions {
    ffmpeg: FFmpeg;
    name: string;
    uri: string;
}

export class Video {
    private readonly ffmpeg: FFmpeg;
    readonly name: string;
    readonly videoUri: string;
    public duration: number = NaN;
    public size: number = NaN;

    static async load(options: VideoConstructorOptions): Promise<Video> {
        const result = new Video(options);
        result.duration = await result.getDuration();
        result.size = await result.getSize();
        return result;
    }

    private constructor({ffmpeg, name, uri}: VideoConstructorOptions) {
        this.ffmpeg = ffmpeg;
        this.name = name;
        this.videoUri = uri;
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
            return await Video.load({
                ffmpeg: this.ffmpeg,
                name: this.name,
                uri: URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'})),
            });
        } finally {
            isRunning = false;
            this.ffmpeg.FS('unlink', fsSourceName);
            this.ffmpeg.FS('unlink', fsDistName);
        }
    }

    async compress(type: CompressType): Promise<Video> {
        if (type === CompressType.original) {
            return this;
        }

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
            return await Video.load({
                ffmpeg: this.ffmpeg,
                name: this.name,
                uri: URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'})),
            });
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

    private async getDuration(): Promise<number> {
        const el = document.createElement('video');
        el.setAttribute('src', this.videoUri);
        return await new Promise((resolve, reject) => {
            // @ts-ignore
            el.addEventListener('loadedmetadata', ({target: {duration}}) => resolve(duration));
            el.addEventListener('error', reject);
        });
    }

    private async getSize(): Promise<number> {
        return(await fetch(this.videoUri).then(r => r.blob())).size;
    }
}
