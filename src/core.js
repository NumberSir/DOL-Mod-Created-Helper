import {
    walk,
    onlyTwineFileFilter,
    onlyJSFileFilter,
    onlyStyleFileFilter,
    onlyImageFileFilter,
    onlyExtraFileFilter
} from "./utils/file-utils.js";
import {
    DIR_DATA,
    DIR_GAME_TWINE,
    DIR_MODS,
    DIR_DATA_PASSAGE,
    DIR_GAME_REPO_ROOT,
    DIR_RESULTS,
    DEFAULT_DEPENDENCE_INFO,
    DEFAULT_ADDON_PLUGIN
} from "./consts.js";

import {promisify} from "util";
import fs from "fs";
import path from "path";
import {simpleGit} from "simple-git";
import JSZip from 'jszip';

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
        await git.submoduleUpdate()
    }
}

class ProcessGamePassage {
    // 为下文的自动填写 replace-addon 做准备
    constructor(modDir) {
        this.modDir = modDir;
    }

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

    async getAllPassagesMod() {
        // 模组中的所有段落和段落名
        let [allPassagesNames, allPassages] = await this.getAllPassages(path.join(DIR_MODS, this.modDir), this.modDir);
        await this.writePassagesMod(allPassages, this.modDir);
        return [allPassagesNames, allPassages]
    }

    async getSamePassagesMod() {
        // 获取在源码中存在的段落
        let samePassagesNames = [];
        let samePassages = [];
        let outputDir = path.join(DIR_DATA_PASSAGE, this.modDir)
        let samePassagesFile = path.join(outputDir, "same_passages.json");
        let samePassagesNamesFile = path.join(outputDir, "same_passages_names.json");

        let [sourcePassagesNames, sourcePassages] = await this.getAllPassagesSource();
        let [modPassagesNames, modPassages] = await this.getAllPassagesMod(this.modDir);

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

    async writePassagesMod(allPassages) {
        return await this.writePassages(allPassages, this.modDir)
    }
}

class ProcessGamePackage {
    // 模组打包相关
    constructor(modDir) {
        this.modDir = modDir;
    }

    async initDirs() {
        for (let dir of [
            DIR_RESULTS
        ]) {
            await promisify(fs.access)(dir).catch(err => {
                fs.mkdirSync(dir);
            });
        }
    }

    async fetchModStructure() {
        // 获取模组文件结构
        let buffer = await promisify(fs.readFile)(path.join(DIR_MODS, this.modDir, "boot.json")).catch(err => {});
        this.bootData = JSON.parse(buffer.toString());

        this.sourceFilesTwine = walk(path.join(DIR_GAME_REPO_ROOT), onlyTwineFileFilter, true);
        this.modFilesTwineAll = walk(path.join(DIR_MODS, this.modDir), onlyTwineFileFilter, true);
        this.modFilesTwineNew = this.modFilesTwineAll.filter((file) => {
            return !(this.sourceFilesTwine.indexOf(file) > -1);
        });  // 过滤掉一致的

        this.sourceFilesScript = walk(path.join(DIR_GAME_REPO_ROOT), onlyJSFileFilter, true);
        this.modFilesScriptSpecial = [];
        this.bootData.scriptFileList_preload
            ? this.modFilesScriptSpecial = this.bootData.scriptFileList_preload
            : this.bootData.scriptFileList_earlyload
            ? this.modFilesScriptSpecial = this.modFilesScriptSpecial.concat(this.bootData.scriptFileList_earlyload)
            : this.bootData.scriptFileList_inject_early
            ? this.modFilesScriptSpecial = this.modFilesScriptSpecial.concat(this.bootData.scriptFileList_inject_early)
            : null
        this.modFilesScriptAll = walk(path.join(DIR_MODS, this.modDir), onlyJSFileFilter, true);
        this.modFilesScriptNormal = this.modFilesScriptAll.filter((file) => {
            return !(this.modFilesScriptSpecial.indexOf(file) > -1);
        });  // 过滤掉特殊的
        this.modFilesScriptNormal = this.modFilesScriptNormal.filter((file) => {
            return !(this.sourceFilesScript.indexOf(file) > -1);
        });  // 过滤掉一致的

        this.sourceFilesStyle = walk(path.join(DIR_GAME_REPO_ROOT), onlyStyleFileFilter, true);
        this.modFilesStyleAll = walk(path.join(DIR_MODS, this.modDir), onlyStyleFileFilter, true);
        this.modFilesStyleNew = this.modFilesStyleAll.filter((file) => {
            return !(this.sourceFilesStyle.indexOf(file) > -1);
        });  // 过滤掉一致的

        this.modFilesImg = walk(path.join(DIR_MODS, this.modDir), onlyImageFileFilter, true);
        this.modFilesAddition = walk(path.join(DIR_MODS, this.modDir), onlyExtraFileFilter, true);
        this.modFilesAddition = this.modFilesAddition.filter((item) => {return item !== "boot.json"});
    }

    async writeBootJson() {
        // 填 BootJson
        await this.writeBootJsonFileLists();
        await this.writeBootJsonAddons()
        // await promisify(fs.writeFile)(path.join(DIR_RESULTS, this.modDir, "boot.json"), JSON.stringify(this.bootData)).catch(err => {});
    }

    async writeBootJsonFileLists() {
        // FileLists
        if (!this.bootData.tweeFileList) this.bootData.tweeFileList = this.modFilesTwineNew;
        if (!this.bootData.scriptFileList) this.bootData.scriptFileList = this.modFilesScriptNormal;
        if (!this.bootData.styleFileList) this.bootData.styleFileList = this.modFilesStyleNew;
        if (!this.bootData.imgFileList) this.bootData.imgFileList = this.modFilesImg;
        if (!this.bootData.additionFile) this.bootData.additionFile = this.modFilesAddition;
        return this.bootData;
    }

    async writeBootJsonAddons() {
        // 依赖相关
        if (!this.bootData.dependenceInfo) this.bootData.dependenceInfo = DEFAULT_DEPENDENCE_INFO;
        if (!this.bootData.addonPlugin) this.bootData.addonPlugin = DEFAULT_ADDON_PLUGIN;
        return this.bootData;
    }

    async writeBootJsonTweeReplacer() {
        // twee 文本替换
    }

    async writeBootJsonReplacePatcher() {
        // js/css 文本替换
    }

    async packageMod() {
        // 打包成 zip
        let zip = new JSZip();
        for (let fileListRequired of [
            this.modFilesTwineNew,
            this.modFilesScriptNormal,
            this.modFilesStyleNew,
            this.modFilesImg,
            this.modFilesAddition
        ]) {
            for (let filepath of fileListRequired) {
                let absolutePath = path.join(DIR_MODS, this.modDir, filepath);
                let content = await promisify(fs.readFile)(absolutePath);
                zip.file(filepath, content);
            }
        }

        for (let fileListOptional of [
            this.bootData.replacePatchList,
            this.bootData.scriptFileList_preload,
            this.bootData.scriptFileList_earlyload,
            this.bootData.scriptFileList_inject_early,
        ]) {
            if (!fileListOptional) {
                continue
            }
            for (let filepath of fileListOptional) {
                let absolutePath = path.join(DIR_MODS, this.modDir, filepath);
                let content = await promisify(fs.readFile)(absolutePath);
                zip.file(filepath, content);
            }
        }

        zip.file("boot.json", JSON.stringify(this.bootData));
        const zipBase64 = await zip.generateAsync({
            type: "nodebuffer",
            compression: "DEFLATE",
            compressionOptions: {level: 9},
        });
        await promisify(fs.writeFile)(path.join(DIR_RESULTS, `${this.bootData.name}.mod.zip`), zipBase64, {encoding: 'utf-8'});
    }
}

(async () => {
    let gamePassage = new ProcessGamePassage("fenghuang-mods")
    await gamePassage.initDirs();
    await gamePassage.getSamePassagesMod()

    let gamePackage = new ProcessGamePackage("fenghuang-mods");
    await gamePackage.initDirs();
    await gamePackage.fetchModStructure();
    await gamePackage.writeBootJson();
    await gamePackage.packageMod();
    // let processGit = new PreProcessGit();
    // await processGit.initGit();
})();

