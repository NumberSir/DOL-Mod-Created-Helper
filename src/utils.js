import fs from "fs";
import path from "path"

import {DIR_DATA_PASSAGE_SOURCE} from "./consts.js";

export function walk(dirPath, filterFunc = null) {
    // 递归读取目录下所有文件名/子目录
    let result = [];
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (let filename of files) {
            let filepath = path.join(dirPath, filename);
            let stats = fs.lstatSync(filepath);

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

function onlySpecificSuffixFilesFilter(filepath, suffix) {
    return filepath.endsWith(suffix);
}

export function onlyTwineFileFilter(filepath) {
    // 只要 .twee 文件
    return onlySpecificSuffixFilesFilter(filepath, ".twee")
}

export function onlyJSFileFilter(filepath) {
    // 只要 .js 文件
    return onlySpecificSuffixFilesFilter(filepath, ".js")
}

export function onlyStyleFileFilter(filepath) {
    // 只要 .css 文件
    return onlySpecificSuffixFilesFilter(filepath, ".css")
}

export function noDropSourcePassageDirFilter(dirpath) {
    // 删目录时别把源码的段落给删了
    return dirpath !== DIR_DATA_PASSAGE_SOURCE;
}
