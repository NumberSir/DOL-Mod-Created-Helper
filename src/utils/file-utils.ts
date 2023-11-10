import fs from "fs";
import path from "path"

import {DIR_DATA_PASSAGE_SOURCE} from "../consts";

export function walk(dirPath: string, filterFunc: ((filepath: string) => boolean) | undefined = undefined, isRelative = false, times = -1, root?: string): string[] {
    // 递归读取目录下所有文件名/子目录
    let result: string[] = [];
    times++;
    if (times === 0) {
        root = dirPath;
    }
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (let filename of files) {
            let filepath = path.join(dirPath, filename);
            let stats = fs.lstatSync(filepath);

            if (stats.isDirectory()) {
                result = result.concat(walk(filepath, filterFunc, isRelative, times, root))
            } else {
                isRelative ? filepath = filepath.replace(`${root}\\`, "") : null;
                !filterFunc ? result.push(filepath.replaceAll("\\", "/"))
                    : filterFunc(filepath)
                        ? result.push(filepath.replaceAll("\\", "/"))
                        : null;
            }
        }
    }
    return result;
}


function onlySpecificSuffixFilesFilter(filepath: string, suffix: string | string[]): boolean {
    if (typeof suffix === "string") {
        return filepath.endsWith(suffix);
    } else if (suffix instanceof Array) {
        return suffix.some((suf) => filepath.endsWith(suf));
    }
    throw new Error("suffix must be string or string[]");
}

export function onlyTwineFileFilter(filepath: string) {
    // 只要 .twee 文件
    return onlySpecificSuffixFilesFilter(filepath, ".twee")
}

export function onlyJSFileFilter(filepath: string) {
    // 只要 .js 文件
    return onlySpecificSuffixFilesFilter(filepath, ".js")
}

export function onlyStyleFileFilter(filepath: string) {
    // 只要 .css 文件
    return onlySpecificSuffixFilesFilter(filepath, ".css")
}

export function onlyImageFileFilter(filepath: string) {
    // 只要图片文件
    return onlySpecificSuffixFilesFilter(filepath, [".png", ".jpg", ".gif", ".svg"])
}

function excludeSpecificSuffixFilesFilter(filepath: string, suffix: string | string[]): boolean {
    if (typeof suffix === "string") {
        return !filepath.endsWith(suffix);
    } else if (suffix instanceof Array) {
        return suffix.every((suf) => !filepath.endsWith(suf));
    }
    throw new Error("suffix must be string or string[]");
}

export function onlyExtraFileFilter(filepath: string) {
    // 除了以上之外的其他文件
    return excludeSpecificSuffixFilesFilter(filepath, [
        ".twee", ".js", ".css",
        ".png", ".jpg", ".gif", ".svg"
    ])
}

export function noDropSourcePassageDirFilter(dirpath: string) {
    // 删目录时别把源码的段落给删了
    return dirpath !== DIR_DATA_PASSAGE_SOURCE;
}
