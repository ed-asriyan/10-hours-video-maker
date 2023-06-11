import type {FFmpeg} from '@ffmpeg/ffmpeg';
import {fetchFile} from '@ffmpeg/ffmpeg';
import {saveAs} from 'file-saver';


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
        const fsSourceName = `LOOP ${this.name}`;
        const fsDistName = `LOOPED ${this.name}`;

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
            this.ffmpeg.FS('unlink', fsSourceName);
            this.ffmpeg.FS('unlink', fsDistName);
        }
    }

    async compress () {
        const fsSourceName = `COMPRESS ${this.name}`;
        const fsDistName = `COMPRESSED ${this.name}`;

        try {
            this.ffmpeg.FS('writeFile', fsSourceName, await fetchFile(this.videoUri));
            await this.ffmpeg.run(
                '-i',
                fsSourceName,
                '-vf', 'scale=420:-2,setsar=1:1',
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                fsDistName,
            );

            const data = this.ffmpeg.FS('readFile', fsDistName);
            return new Video(this.ffmpeg, this.name, URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'})));
        } finally {
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
