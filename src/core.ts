import { walk, onlyTwineFileFilter } from "./utils.js";
import { DATA_DIR, GAME_DIR, MODS_DIR, PASSAGE_DATA_DIR } from "./consts.js";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import * as buffer from "buffer";

interface Passage {
    passageName: string
    passageBody: string
    filepath: string
    filename: string
}

class ProcessGamePassage {
    async initDirs(): Promise<void> {
        for (let dir of [DATA_DIR, MODS_DIR, PASSAGE_DATA_DIR]) {
            await promisify(fs.access)(dir).catch(err => {
                fs.mkdirSync(dir);
            })
        }
    }

    async getAllPassages(dirPath: string, name: string): Promise<[string[], Passage[]]> {
        // 所有段落和段落名
        let outputDir: string = path.join(PASSAGE_DATA_DIR, name)
        await promisify(fs.access)(outputDir).catch(async (): Promise<void> => {
            await promisify(fs.mkdir)(outputDir).catch(err => {
                console.error(`ERROR when mkdir of ${outputDir}`);
                return Promise.reject(err);
            })
        })
        let allPassages: Passage[] = [];
        let allPassagesNames: string[] = [];
        let allPassagesFile: string = path.join(outputDir, "all_passages.json");
        let allPassagesNamesFile: string = path.join(outputDir, "all_passages_names.json");

        let allTwineFiles: string[] = walk(dirPath, onlyTwineFileFilter);
        for (let file of allTwineFiles) {
            let content: buffer.Buffer = await promisify(fs.readFile)(file).catch(err => {return Promise.reject(err)});
            let contentSlice: string[] = content.toString().split(":: ");
            contentSlice = contentSlice.filter((item, idx) => idx % 2 !== 0);
            // slice 中的偶数元素包含标题

            for (let text of contentSlice) {
                // 标题是第一处换行前的内容
                text = text.replace("\r", "\n");
                let passageName = text.split("\n")[0];
                let passageBody = text.split("\n").slice(1, -1).join("\n");
                passageName.endsWith("]")
                    ? passageName = passageName.split("[")[0].trim()
                    : null;

                allPassagesNames.push(passageName)
                allPassages.push({
                    passageName: passageName,
                    passageBody: passageBody,
                    filepath: file,
                    filename: path.basename(file, ".twee")
                })
            }
        }

        await promisify(fs.writeFile)(allPassagesFile, JSON.stringify(allPassages)).catch(err => {return Promise.reject(err)});
        await promisify(fs.writeFile)(allPassagesNamesFile, JSON.stringify(allPassagesNames)).catch(err => {return Promise.reject(err)});
        return [allPassagesNames, allPassages]
    }

    async getAllPassagesSource(): Promise<[string[], Passage[]]> {
        // 源码中的所有段落和段落名
        return await this.getAllPassages(GAME_DIR, "source");
    }

    async getAllPassagesMod(modName: string): Promise<[string[], Passage[]]> {
        // 模组中的所有段落和段落名
        return await this.getAllPassages(path.join(MODS_DIR, modName), modName);
    }

    async getSamePassages(modName: string): Promise<[string[], Passage[]]> {
        // 获取在源码中存在的段落
        let samePassagesNames: string[] = [];
        let samePassages: Passage[] = [];
        let outputDir: string = path.join(PASSAGE_DATA_DIR, modName)
        let samePassagesFile: string = path.join(outputDir, "same_passages.json");
        let samePassagesNamesFile: string = path.join(outputDir, "same_passages_names.json");

        let [sourcePassagesNames, sourcePassages]: [string[], Passage[]] = await this.getAllPassagesSource();
        let [modPassagesNames, modPassages]: [string[], Passage[]] = await this.getAllPassagesMod(modName);

        for (let passage of modPassages) {
            if (sourcePassagesNames.includes(passage.passageName)) {
                samePassagesNames.push(passage.passageName);
                samePassages.push(passage)
            }
        }

        await promisify(fs.writeFile)(samePassagesFile, JSON.stringify(samePassages)).catch(err => {return Promise.reject(err)});
        await promisify(fs.writeFile)(samePassagesNamesFile, JSON.stringify(samePassagesNames)).catch(err => {return Promise.reject(err)});

        return [samePassagesNames, samePassages]
    }

    generateDiffFiles() {
        // TODO: 生成差异文件
    }
}

(async () => {
    let gameSource: ProcessGamePassage = new ProcessGamePassage()
    await gameSource.initDirs();
    await gameSource.getSamePassages("Remy Love Mod")
})();

