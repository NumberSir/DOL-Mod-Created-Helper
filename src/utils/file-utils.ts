import fs from "fs";
import path from "path"

import {DIR_DATA_PASSAGE_SOURCE} from "../consts";

/**
 * 递归读取目录下所有文件名/子目录
 * @param dirPath 目录路径
 * @param filterFunc 对文件特殊的筛选函数
 * @param isRelative 输出的是否是相对路径
 * @param times 函数内用于判断起始点的变量
 * @param root 输出相对路径时使用的变量
 */
export function walk(dirPath: string, filterFunc: ((filepath: string) => boolean) | undefined = undefined, isRelative: boolean = false, times: number = -1, root?: string): string[] {
    let result: string[] = [];
    times++;

    if (times === 0) root = dirPath;

    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (let filename of files) {
            let filepath = path.join(dirPath, filename);
            let stats = fs.lstatSync(filepath);

            if (stats.isDirectory()) {
                result = result.concat(walk(filepath, filterFunc, isRelative, times, root))
            } else {
                isRelative ? filepath = filepath.replace(`${root}\\`, "") : null;
                !filterFunc
                    ? result.push(filepath.replaceAll("\\", "/"))
                    : filterFunc(filepath)
                        ? result.push(filepath.replaceAll("\\", "/"))
                        : null;
            }
        }
    }
    return result;
}

/**
 * 遍历文件时只要特定后缀的
 * @param filepath 文件路径
 * @param suffix 单个特定后缀或后缀数组
 */
function onlySpecificSuffixFilesFilter(filepath: string, suffix: string | string[]): boolean {
    if (typeof suffix === "string") {
        return filepath.endsWith(suffix);
    } else if (suffix instanceof Array) {
        return suffix.some((suf) => filepath.endsWith(suf));
    }
    throw new Error("suffix must be string or string[]");
}

/**
 * 遍历文件只要 .twee 后缀的
 * @param filepath 文件路径
 */
export function onlyTwineFileFilter(filepath: string) {
    return onlySpecificSuffixFilesFilter(filepath, ".twee")
}

/**
 * 遍历文件只要 .js 后缀的
 * @param filepath 文件路径
 */
export function onlyJSFileFilter(filepath: string) {
    return onlySpecificSuffixFilesFilter(filepath, ".js")
}

/**
 * 遍历文件只要 .css 后缀的
 * @param filepath 文件路径
 */
export function onlyStyleFileFilter(filepath: string) {
    return onlySpecificSuffixFilesFilter(filepath, ".css")
}

/**
 * 遍历文件只要图片
 * @param filepath 文件路径
 */
export function onlyImageFileFilter(filepath: string) {
    return onlySpecificSuffixFilesFilter(filepath, [".png", ".jpg", ".gif", ".svg"])
}

/**
 * 遍历文件时排除特定后缀的
 * @param filepath 文件路径
 * @param suffix 单个特定后缀或后缀数组
 */
function excludeSpecificSuffixFilesFilter(filepath: string, suffix: string | string[]): boolean {
    if (typeof suffix === "string") {
        return !filepath.endsWith(suffix);
    } else if (suffix instanceof Array) {
        return suffix.every((suf) => !filepath.endsWith(suf));
    }
    throw new Error("suffix must be string or string[]");
}

/**
 * 除了 .twee, .js, .css 和图片文件之外的其他文件
 * @param filepath 文件路径
 */
export function onlyExtraFileFilter(filepath: string) {
    return excludeSpecificSuffixFilesFilter(filepath, [
        ".twee", ".js", ".css",
        ".png", ".jpg", ".gif", ".svg"
    ])
}

/**
 * 删除时排除掉源码根目录
 * @param dirpath 目录路径
 */
export function noDropSourcePassageDirFilter(dirpath: string) {
    return dirpath !== DIR_DATA_PASSAGE_SOURCE;
}
