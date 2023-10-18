import {walk, onlyTwineFileFilter} from "./utils.js";
import {
    DIR_DATA,
    DIR_GAME_TWINE,
    DIR_MODS,
    DIR_DATA_PASSAGE,
    DIR_GAME_REPO_ROOT,
    URL_GAME_REPO_REMOTE,
    DIR_MODLOADER_BUILT_ROOT, DIR_REPOSITORY
} from "./consts.js";
import {promisify} from "util";
import fs from "fs";
import path from "path";
import {simpleGit}  from "simple-git";

class PreProcessGit {
    // 仓库相关
    async initGit() {
        const progress = ({method, stage, progress}) => {
            // checkout, clone, fetch, pull, push 可以查看进度
            console.log(`[PROGESS] git.${method} ${stage} stage ${progress}% complete`);
        };
        const options = {
            baseDir: process.cwd(),
            binary: 'git',
            maxConcurrentProcesses: 8,
            trimmed: false,

            progress,
            completion: {
                onExit: 50,
                onClose: true
            },
            timeout: {
                block: 2000  // ms
            }
        };

        let git = simpleGit(options);
        let status = await git.subModule()
        console.log("status: ", status)
        await git.submoduleUpdate()
        // await git.addRemote('master', URL_GAME_REPO_REMOTE).catch(() => {
        //     console.warn("[WARN] game repo remote already exists!");
        // });

        // let files = await promisify(fs.readdir)(DIR_GAME_REPO_ROOT);
        // if (!files) {
        //     await git.clone(URL_GAME_REPO_REMOTE, DIR_GAME_REPO_ROOT).catch((err) => {
        //         console.warn("[ERROR] ERROR when cloning the game repo: ", err);
        //     });
        // } else {
        //     await git.pull(URL_GAME_REPO_REMOTE, 'master').catch((err) => {
        //         console.warn("[ERROR] ERROR when pulling the game repo: ", err);
        //     });
        // }
    }

    async getLatestCommits() {
        // 决定是否要更新
    }
}

class PreProcessGameSourceCode {
    // 游戏源码相关
}

class PreProcessModLoader {
    // ModLoader 相关
}

class ProcessGamePassage {
    // 为下文的自动填写 replace-addon 做准备
    async initDirs() {
        for (let dir of [
            DIR_DATA,
            DIR_MODS,
            DIR_DATA_PASSAGE
        ]) {
            await promisify(fs.access)(dir).catch(err => {
                fs.mkdirSync(dir);
            });
        }
    }

    async dropDirs(filterFunc = null) {
        for (let dir of [

        ]) {
            await promisify(fs.access)(dir).then(() => {
                filterFunc === null || undefined
                    ? fs.rmdirSync(dir)
                    : filterFunc(dir)
                    ? fs.rmdirSync(dir)
                    : null;
            });
        }
    }

    async getAllPassages(dirPath, name) {
        // 所有段落和段落名
        let outputDir = path.join(DIR_DATA_PASSAGE, name);
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
                let passageFull = `:: ${passageName}\n${passageBody}`;
                passageName.endsWith("]")
                    ? passageName = passageName.split("[")[0].trim()
                    : null;

                allPassagesNames.push(passageName);
                allPassages.push({
                    passageName: passageName,
                    passageBody: passageBody,
                    passageFull: passageFull,
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
        let [allPassagesNames, allPassages] = await this.getAllPassages(DIR_GAME_TWINE, "source");
        await this.writePassagesSource(allPassages);
        return [allPassagesNames, allPassages]
    }

    async getAllPassagesMod(modName) {
        // 模组中的所有段落和段落名
        let [allPassagesNames, allPassages] = await this.getAllPassages(path.join(DIR_MODS, modName), modName);
        await this.writePassagesMod(allPassages, modName);
        return [allPassagesNames, allPassages]
    }

    async getSamePassagesMod(modName) {
        // 获取在源码中存在的段落
        let samePassagesNames = [];
        let samePassages = [];
        let outputDir = path.join(DIR_DATA_PASSAGE, modName)
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

        return [samePassagesNames, samePassages]
    }

    async writePassages(allPassages, name) {
        // 分开写成文件
        let outputDir = path.join(DIR_DATA_PASSAGE, name, "all_passages");
        await promisify(fs.access)(outputDir).catch(async () => {
            await promisify(fs.mkdir)(outputDir).catch(err => {
                console.error(`ERROR when mkdir of ${outputDir}`);
                return Promise.reject(err);
            })
        })

        for (let passage of allPassages) {
            passage.passageName = passage.passageName.replace('/', '_SLASH_');
            let passageFile = path.join(outputDir, `${passage.passageName}.twee`);
            await promisify(fs.writeFile)(passageFile, passage.passageFull).catch(err => {return Promise.reject(err)});
        }
    }

    async writePassagesSource(allPassages) {
        return await this.writePassages(allPassages, "source")
    }

    async writePassagesMod(allPassages, modName) {
        return await this.writePassages(allPassages, modName)
    }
}


(async () => {
    // let gamePassage = new ProcessGamePassage()
    // await gamePassage.initDirs();
    // await gamePassage.getSamePassagesMod("Chololate-Factory-mod")

    let processGit = new PreProcessGit();
    await processGit.initGit();
})();

