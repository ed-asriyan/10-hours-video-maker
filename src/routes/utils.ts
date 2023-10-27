export const formatDuration = function (minutes: number): string {
    // https://www.30secondsofcode.org/js/s/format-duration/
    const time = {
        hour: Math.floor(minutes / 60),
        minute: minutes % 60
    }
    return Object.entries(time)
        .filter((val) => val[1] !== 0)
        .map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
        .join(', ')
};

export const formatSize = function (fileSizeInBytes: number): string {
    let i = -1
    const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
    do {
        fileSizeInBytes /= 1024
        i++
    } while (fileSizeInBytes > 1024)

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
};
