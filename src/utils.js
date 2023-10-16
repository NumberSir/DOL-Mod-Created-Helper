import fs from "fs";
import path from "path"

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

export function onlyTwineFileFilter(filepath) {
    // 只要 .twee 文件
    return filepath.endsWith(".twee");
}