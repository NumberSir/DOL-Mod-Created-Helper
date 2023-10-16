import { walk, onlyTwineFileFilter } from "./utils.js";
import { DATA_DIR, GAME_DIR, MODS_DIR, PASSAGE_DATA_DIR } from "./consts.js";
import { promisify } from "util";
import fs from "fs";
import path from "path";

class ProcessGamePassage {
    async initDirs() {
        for (let dir of [DATA_DIR, MODS_DIR, PASSAGE_DATA_DIR]) {
            await promisify(fs.access)(dir).catch(err => {
                fs.mkdirSync(dir);
            })
        }
    }

    async getAllPassages(dirPath, name) {
        // 所有段落和段落名
        let outputDir = path.join(PASSAGE_DATA_DIR, name)
        await promisify(fs.access)(outputDir).catch(async () => {
            await promisify(fs.mkdir)(outputDir).catch(err => {
                console.error(`ERROR when mkdir of ${outputDir}`);
                return Promise.reject(err);
            })
        })
        let allPassages = [];
        let allPassagesNames = [];
        let allPassagesFile = path.join(outputDir, "all_passages.json");
        let allPassagesNamesFile = path.join(outputDir, "all_passages_names.json");

        let allTwineFiles = walk(dirPath, onlyTwineFileFilter);
        for (let file of allTwineFiles) {
            let content = await promisify(fs.readFile)(file).catch(err => {return Promise.reject(err)});
            let contentSlice = content.toString().split(":: ");
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

    async getAllPassagesSource() {
        // 源码中的所有段落和段落名
        return await this.getAllPassages(GAME_DIR, "source");
    }

    async getAllPassagesMod(modName) {
        // 模组中的所有段落和段落名
        return await this.getAllPassages(path.join(MODS_DIR, modName), modName);
    }

    async getSamePassages(modName) {
        // 获取在源码中存在的段落
        let samePassagesNames = [];
        let samePassages = [];
        let outputDir = path.join(PASSAGE_DATA_DIR, modName)
        let samePassagesFile = path.join(outputDir, "same_passages.json");
        let samePassagesNamesFile = path.join(outputDir, "same_passages_names.json");

        let [sourcePassagesNames, sourcePassages] = await this.getAllPassagesSource();
        let [modPassagesNames, modPassages] = await this.getAllPassagesMod(modName);

        for (let passage of modPassages) {
            if (sourcePassagesNames.includes(passage.passageName)) {
                samePassagesNames.push(passage.passageName);
                samePassages.push(passage)
            }
        }

        await promisify(fs.writeFile)(samePassagesFile, JSON.stringify(samePassages)).catch(err => {return Promise.reject(err)});
        await promisify(fs.writeFile)(samePassagesNamesFile, JSON.stringify(samePassagesNames)).catch(err => {return Promise.reject(err)});
    }

    generateDiffFiles() {
        // TODO: 生成差异文件

    }
}

(async () => {
    let gameSource = new ProcessGamePassage()
    await gameSource.initDirs();
    await gameSource.getSamePassages("Remy Love Mod")
})();

