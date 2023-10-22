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
    DEFAULT_ADDON_PLUGIN, DIR_DATA_TEMP, DIR_MODLOADER_BUILT_ROOT, DIR_MODLOADER_BUILT_MODS, DIR_ROOT
} from "./consts.js";

import {promisify} from "util";
import {osLocale} from "os-locale";
import axios from "axios";
import JSZip from 'jszip';

import fs, {createWriteStream} from "fs";
import path from "path";
import https from "https";
import child_process from "child_process";
import stream from "stream";

class PreProcessModLoader {
    // 下载解压预编译好的方便测试
    async initDirs() {
        // 新建临时文件夹和目标文件夹
        for (let dir of [DIR_DATA_TEMP, DIR_MODLOADER_BUILT_ROOT]) {
            await promisify(fs.access)(dir).catch(() => {fs.mkdirSync(dir);});
        }
    }

    async judgeIsLatest() {
        // 要不要重复下载
        console.log("开始获取最新版 ModLoader 版本...")
        let localIdFile = path.join(DIR_DATA_TEMP, "modloader-id.txt");
        let latestUrl = "https://api.github.com/repos/Lyoko-Jeremie/DoLModLoaderBuild/releases/latest"
        let response = await axios.get(latestUrl, {httpsAgent: new https.Agent({rejectUnauthorized: false})});
        let latestId = response.data.assets[0].id;
        if (!fs.existsSync(localIdFile)) {
            console.log(`首次运行，写入最新版 ModLoader 版本: ${latestId}`)
            fs.writeFileSync(localIdFile, latestId.toString());
            return false;
        }

        let localId = (await promisify(fs.readFile)(localIdFile)).toString();
        return localId === latestId.toString();
    }

    async downloadLatestBuiltModLoader() {
        let isLatest = await this.judgeIsLatest();
        if (isLatest) {
            console.log("当前 ModLoader 已是最新版！")
            return
        }

        console.log("开始下载预编译好的 ModLoader...")
        let latestUrl = "https://api.github.com/repos/Lyoko-Jeremie/DoLModLoaderBuild/releases/latest"
        let response = await axios.get(
            latestUrl,
            {httpsAgent: new https.Agent({rejectUnauthorized: false})}
        );
        let downloadUrl = response.data.assets[0].browser_download_url;

        let language = await osLocale();
        if (language === "zh-CN") downloadUrl = `https://ghproxy.com/${downloadUrl}`;  // 代理

        const writer = createWriteStream(path.join(DIR_DATA_TEMP, "modloader.zip"));
        const finished = promisify(stream.finished);
        axios({
            method: "get",
            url: downloadUrl,
            responseType: "stream"
        }).then(async (response) => {
            response.data.pipe(writer);
            console.log("预编译好的 ModLoader 已下载完毕！")
            return finished(writer);
        }).then(async () => {
            return await this.extractBuiltModLoader()
        })
    }

    judgeIsExtracted() {
        // 要不要重复解压
        return fs.existsSync(path.join(DIR_MODLOADER_BUILT_ROOT, "Degrees of Lewdity VERSION.html.mod.html"))
    }

    async extractBuiltModLoader() {
        // 解压
        if (this.judgeIsExtracted()) {
            console.log("当前 ModLoader 已经解压过了！")
            return
        }

        console.log("开始解压 ModLoader...")
        let zip = new JSZip();
        let binary = await promisify(fs.readFile)(path.join(DIR_DATA_TEMP, "modloader.zip")).catch(err => {});
        let modLoaderPackage = await zip.loadAsync(binary);
        let zipFiles = modLoaderPackage.files;

        for (let filepath of Object.keys(zipFiles)) {
            let destination = path.join(DIR_MODLOADER_BUILT_ROOT, filepath);
            if (zipFiles[filepath].dir) {
                fs.mkdirSync(destination, {recursive: true});
            } else {
                let buffer = await zipFiles[filepath].async("nodebuffer");
                await promisify(fs.writeFile)(destination, buffer);
                console.log("预编译好的 ModLoader 已解压完毕")
            }
        }
    }
}

class PreProcessModI18N {
    async judgeIsLatest() {
        // 要不要重复下载
        console.log("开始获取最新版汉化模组版本...")
        let localIdFile = path.join(DIR_DATA_TEMP, "i18n-id.txt");
        let latestUrl = "https://api.github.com/repos/NumberSir/DoL-I18n-Build/releases/latest"
        let response = await axios.get(latestUrl, {httpsAgent: new https.Agent({rejectUnauthorized: false})});
        let latestId = response.data.assets[0].id;
        if (!fs.existsSync(localIdFile)) {
            console.log(`首次运行，写入最新版汉化模组版本: ${latestId}`)
            fs.writeFileSync(localIdFile, latestId.toString());
            return false;
        }

        let localId = (await promisify(fs.readFile)(localIdFile)).toString();
        return localId === latestId.toString();
    }

    async downloadLatestModI18N() {
        let isLatest = await this.judgeIsLatest();
        let language = await osLocale();
        if (isLatest || language !== "zh-CN") {
            console.log("无需下载汉化模组")
            return
        }

        console.log("开始下载最新版汉化模组...")
        let latestUrl = "https://api.github.com/repos/NumberSir/DoL-I18n-Build/releases/latest"
        let response = await axios.get(latestUrl, {httpsAgent: new https.Agent({rejectUnauthorized: false})});
        let downloadUrl = response.data.assets[0].browser_download_url;

        downloadUrl = `https://ghproxy.com/${downloadUrl}`;
        axios({
            method: "get",
            url: downloadUrl,
            responseType: "stream"
        }).then((response) => {
            response.data.pipe(fs.createWriteStream(
                path.join(DIR_DATA_TEMP, "i18n.zip")
            ))
            console.log("汉化模组已下载完毕！")
        })
    }

    async remoteLoadTest() {
        // 通过填写 modList.json 远程加载模组
        await promisify(fs.copyFile)(
            path.join(DIR_DATA_TEMP, "i18n.zip"),
            path.join(DIR_MODLOADER_BUILT_MODS, "i18n.zip")
        ).catch(err => {});

        await promisify(fs.writeFile)(path.join(DIR_MODLOADER_BUILT_ROOT, "modList.json"), JSON.stringify(["mods/i18n.zip"]));
    }
}

class ProcessGamePassage {
    // 为下文的自动填写 replace-addon 做准备
    constructor(modDir) {
        this.modDir = modDir;
    }

    async initDirs() {
        for (let dir of [DIR_DATA, DIR_MODS, DIR_DATA_PASSAGE]) {
            await promisify(fs.access)(dir).catch(() => {fs.mkdirSync(dir)});
        }
    }

    async getAllPassages(dirPath, name) {
        // 所有段落和段落名
        console.log(`开始获取 ${name} 所有段落信息...`)
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

        console.log(`${name} 所有段落信息已获取完毕！共 ${allPassagesNames.length} 个段落。`)
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

        console.log("开始获取修改源码的段落信息...");
        for (let passage of modPassages) {
            if (sourcePassagesNames.includes(passage.passageName)) {
                samePassagesNames.push(passage.passageName);
                samePassages.push(passage)
            }
        }

        await promisify(fs.writeFile)(samePassagesFile, JSON.stringify(samePassages)).catch(err => {return Promise.reject(err)});
        await promisify(fs.writeFile)(samePassagesNamesFile, JSON.stringify(samePassagesNames)).catch(err => {return Promise.reject(err)});

        console.log(`修改源码的段落信息已获取完毕！共 ${samePassagesNames.length} 个段落。`);
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
        for (let dir of [DIR_RESULTS, DIR_MODLOADER_BUILT_MODS]) {
            await promisify(fs.access)(dir).catch(() => {fs.mkdirSync(dir)});
        }
    }

    async fetchModStructure() {
        // 获取模组文件结构
        console.log(`开始获取 ${this.modDir} 模组文件结构...`)
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
        console.log(`${this.modDir} 模组文件结构已获取完毕！`)
    }

    async writeBootJson() {
        // 填 BootJson
        console.log(`开始填写 ${this.modDir} 模组 boot.json ...`)
        await this.writeBootJsonFileLists();
        await this.writeBootJsonAddons()
        // await promisify(fs.writeFile)(path.join(DIR_RESULTS, this.modDir, "boot.json"), JSON.stringify(this.bootData)).catch(err => {});
        console.log(`${this.modDir} 模组 boot.json 已填写完毕！`)
    }

    async writeBootJsonFileLists() {
        // FileLists
        if (!this.bootData.tweeFileList) this.bootData.tweeFileList = this.modFilesTwineNew;
        if (!this.bootData.scriptFileList) this.bootData.scriptFileList = this.modFilesScriptNormal;
        if (!this.bootData.styleFileList) this.bootData.styleFileList = this.modFilesStyleNew;
        if (!this.bootData.imgFileList) this.bootData.imgFileList = this.modFilesImg;
        if (!this.bootData.additionFile) this.bootData.additionFile = this.modFilesAddition;
        console.log(`\t${this.modDir} 模组文件列表已填写完毕！`)
        return this.bootData;
    }

    async writeBootJsonAddons() {
        // 依赖相关
        if (!this.bootData.dependenceInfo) this.bootData.dependenceInfo = DEFAULT_DEPENDENCE_INFO;
        if (!this.bootData.addonPlugin) this.bootData.addonPlugin = DEFAULT_ADDON_PLUGIN;
        console.log(`\t${this.modDir} 模组依赖列表已填写完毕！`)
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
        console.log(`开始打包 ${this.modDir} 模组为压缩文件...`)
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
        console.log(`${this.modDir} 模组已打包完毕！`)
    }

    async remoteLoadTest() {
        // 通过填写 modList.json 远程加载模组方便测试
        await promisify(fs.rename)(
            path.join(DIR_RESULTS, `${this.bootData.name}.mod.zip`),
            path.join(DIR_MODLOADER_BUILT_MODS, `${this.bootData.name}.mod.zip`)
        ).catch(err => {});

        await promisify(fs.access)(path.join(DIR_MODLOADER_BUILT_ROOT, `modList.json`)).catch(err => {
            fs.writeFileSync(path.join(DIR_MODLOADER_BUILT_ROOT, `modList.json`), JSON.stringify([
                `mods/${this.bootData.name}.mod.zip`
            ]));
        });
        let modListDataBuffer = await promisify(fs.readFile)(path.join(DIR_MODLOADER_BUILT_ROOT, `modList.json`));
        let modListData = JSON.parse(modListDataBuffer);
        if (!modListData.includes(`mods/${this.bootData.name}.mod.zip`)) {
            modListData.push(`mods/${this.bootData.name}.mod.zip`);
        }

        await promisify(fs.writeFile)(path.join(DIR_MODLOADER_BUILT_ROOT, `modList.json`), JSON.stringify(modListData));
    }
}

async function preDownload() {
    const modLoader = new PreProcessModLoader();
    await modLoader.initDirs();
    await modLoader.downloadLatestBuiltModLoader();

    const modI18N = new PreProcessModI18N();
    await modI18N.downloadLatestModI18N();
    await modI18N.remoteLoadTest();
}

(async () => {
    const modLoader = new PreProcessModLoader();
    await modLoader.initDirs();
    await modLoader.downloadLatestBuiltModLoader();

    const modI18N = new PreProcessModI18N();
    await modI18N.downloadLatestModI18N();
    await modI18N.remoteLoadTest();

    const gamePassage = new ProcessGamePassage("fenghuang-mods")
    await gamePassage.initDirs();
    await gamePassage.getSamePassagesMod()

    const gamePackage = new ProcessGamePackage("fenghuang-mods");
    await gamePackage.initDirs();
    await gamePackage.fetchModStructure();
    await gamePackage.writeBootJson();
    await gamePackage.packageMod();
    await gamePackage.remoteLoadTest();

    console.log("启动本地服务器...")
    child_process.exec("start http://localhost:8000/modloader/Degrees%20of%20Lewdity%20VERSION.html.mod.html");
    console.log("如果浏览器没有自动启动，请手动打开\nhttp://localhost:8080/Degrees%20of%20Lewdity%20VERSION.html.mod.html\n网页")
    child_process.exec("anywhere -s")
})();

