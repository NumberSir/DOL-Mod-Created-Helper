import fs from "fs";
import path from "path"

export function walk(dirPath: string, filterFunc: Function | null = null): string[] {
    // 递归读取目录下所有文件名/子目录
    let result: string[] = [];
    if (fs.existsSync(dirPath)) {
        const files: string[] = fs.readdirSync(dirPath);
        for (let filename of files) {
            let filepath: string = path.join(dirPath, filename);
            let stats: fs.Stats = fs.lstatSync(filepath);

            stats.isDirectory()
                ? result = result.concat(walk(filepath, filterFunc))
                : filterFunc === null || undefined
                    ? result.push(filepath)
                    : filterFunc(filepath)
                        ? result.push(filepath)
                        : null;
        }
    }
    return result;
}

function onlySpecificSuffixFilesFilter(filepath: string, suffix: string): boolean {
    return filepath.endsWith(suffix);
}

export function onlyTwineFileFilter(filepath: string): boolean {
    // 只要 .twee 文件
    return onlySpecificSuffixFilesFilter(filepath, ".twee")
}

export function onlyJSFileFilter(filepath: string): boolean {
    // 只要 .js 文件
    return onlySpecificSuffixFilesFilter(filepath, ".js")
}

export function onlyStyleFileFilter(filepath: string): boolean {
    // 只要 .css 文件
    return onlySpecificSuffixFilesFilter(filepath, ".css")
}
