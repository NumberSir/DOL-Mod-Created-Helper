import {
    walk,
    onlyTwineFileFilter,
    onlyJSFileFilter,
    onlyStyleFileFilter,
    onlyImageFileFilter,
    onlyExtraFileFilter
} from "./utils/file-utils";

import {
    DIR_DATA,
    DIR_GAME_TWINE,
    DIR_MODS,
    DIR_DATA_PASSAGE,
    DIR_GAME_REPO_ROOT,
    DIR_RESULTS,
    DEFAULT_DEPENDENCE_INFO,
    DEFAULT_ADDON_PLUGIN,
    DIR_DATA_TEMP,
    DIR_MODLOADER_BUILT_ROOT,
    DIR_MODLOADER_BUILT_MODS,
    GITHUB_HEADERS,
    URL_MODLOADER_BUILD_RELEASE_API,
    URL_MODI18N_BUILD_RELEASE_API,
    URL_GITHUB_PROXY,
    DIR_DATA_PASSAGE_SOURCE,
    DIR_MODLOADER_REPO_ROOT, DIR_DATA_DIFF
} from "./consts";

import {
    AllPassageInfoType, Diff, DiffOperator,
    GetAllPassageReturnType, PassageInfoType
} from "./models";

import {promisify} from "util";
import {osLocale} from "os-locale";
import axios from "axios";
import JSZip from 'jszip';
import {has, get} from 'lodash';

import fs, {createWriteStream} from "fs";
import path from "path";
import https from "https";
import * as console from "console";
import {TweeReplacerParam} from "./builtins/twee-replacer";

/**
 * 新建临时文件夹和目标文件夹
 */
export async function initDirs() {
    for (let dir of [
        DIR_DATA_TEMP, DIR_MODLOADER_BUILT_ROOT, DIR_DATA,
        DIR_MODS, DIR_DATA_PASSAGE, DIR_RESULTS,
        DIR_MODLOADER_BUILT_MODS,
        DIR_DATA_DIFF
    ]) {
        await promisify(fs.access)(dir).catch(async () => {
            return await promisify(fs.mkdir)(dir, {recursive: true});
        });
    }
}

/**
 * 下载并处理预编译好的 ModLoader 相关
 */
export class PreProcessModLoader {
    /**
     * 要不要重复下载
     */
    async judgeIsLatest() {
        console.log("Starting to fetch latest ModLoader version...")
        let localIdFile = path.join(DIR_DATA_TEMP, "modloader-id.txt");
        let response = await axios.get(
            URL_MODLOADER_BUILD_RELEASE_API,
            {
                httpsAgent: new https.Agent({rejectUnauthorized: false}),
                headers: GITHUB_HEADERS
            },
        );
        let latestId = response.data.assets[0].id;
        if (
            !await promisify(fs.exists)(localIdFile)
            || !await promisify(fs.exists)(path.join(DIR_DATA_TEMP, "modloader.zip"))
        ) {
            console.log(`Initializing... writing in latest ModLoader version: ${latestId}`)
            await promisify(fs.writeFile)(localIdFile, latestId.toString());
            return false;
        }

        let localId = (await promisify(fs.readFile)(localIdFile)).toString();
        return localId === latestId.toString();
    }

    /**
     * 下载预编译好的 ModLoader
     */
    async downloadLatestBuiltModLoader() {
        let isLatest = await this.judgeIsLatest();
        if (isLatest) {
            console.log("ModLoader is latest already!")
            return
        }

        console.log("Starting to download pre-compiled ModLoader...")
        let response = await axios.get(
            URL_MODLOADER_BUILD_RELEASE_API,
            {
                httpsAgent: new https.Agent({rejectUnauthorized: false}),
                headers: GITHUB_HEADERS
            }
        );
        let downloadUrl = response.data.assets[0].browser_download_url;

        let language = await osLocale();
        if (language === "zh-CN") downloadUrl = `${URL_GITHUB_PROXY}/${downloadUrl}`;  // 镜像

        await axios({
            method: "get",
            url: downloadUrl,
            responseType: "stream",
            headers: GITHUB_HEADERS
        }).then((response) => {
            return new Promise<void>((resolve, reject) => {
                let writeStream = response.data.pipe(fs.createWriteStream(
                    path.join(DIR_DATA_TEMP, "modloader.zip")
                ))
                writeStream.on('finish', async () => {
                    try {
                        console.log("ModLoader downloaded done!")
                        await this.extractBuiltModLoader();
                        resolve();
                    } catch (e) {
                        console.error(e);
                        reject(e);
                    }
                });
                writeStream.on('error', (e: any) => {
                    console.error(e);
                    reject(e);
                });
            });
        });
    }

    /**
     * 解压预编译好的 ModLoader
     */
    async extractBuiltModLoader() {
        let zip = new JSZip();
        let binary = await promisify(fs.readFile)(path.join(DIR_DATA_TEMP, "modloader.zip")).catch(err => {});
        if (!binary) {
            console.error("ERROR extractBuiltModLoader() cannot read modloader.zip");
            throw new Error("ERROR extractBuiltModLoader() cannot read modloader.zip");
        }
        let modLoaderPackage = await zip.loadAsync(binary);
        let zipFiles = modLoaderPackage.files;

        for (let filepath of Object.keys(zipFiles)) {
            let destination = path.join(DIR_MODLOADER_BUILT_ROOT, filepath);
            if (zipFiles[filepath].dir) {
                return await promisify(fs.mkdir)(destination, {recursive: true});
            } else {
                let buffer = await zipFiles[filepath].async("nodebuffer");
                await promisify(fs.writeFile)(destination, buffer);
            }
        }
    }
}

/**
 * 下载并处理 I18N 模组相关
 */
export class PreProcessModI18N {
    /**
     * 要不要重复下载
     */
    async judgeIsLatest() {
        console.log("Starting to fetch latest I18N mod version...")
        let localIdFile = path.join(DIR_DATA_TEMP, "i18n-id.txt");
        let response = await axios.get(
            URL_MODI18N_BUILD_RELEASE_API,
            {
                httpsAgent: new https.Agent({rejectUnauthorized: false}),
                headers: GITHUB_HEADERS
            }
        );
        let latestId = response.data.assets[0].id;
        if (!await promisify(fs.exists)(localIdFile) || !await promisify(fs.exists)(path.join(DIR_MODLOADER_BUILT_MODS, "i18n.zip"))) {
            console.log(`Initializing... writing in latest I18N mod version: ${latestId}`)
            await promisify(fs.writeFile)(localIdFile, latestId.toString());
            return false;
        }

        let localId = (await promisify(fs.readFile)(localIdFile)).toString();
        return localId === latestId.toString();
    }

    /**
     * 下载汉化模组
     */
    async downloadLatestModI18N() {
        let isLatest = await this.judgeIsLatest();
        let language = await osLocale();
        if (isLatest || language !== "zh-CN") {
            console.log("I18N mod is latest already!")
            return
        }

        console.log("Starting to download I18N mod...")
        let response = await axios.get(
            URL_MODI18N_BUILD_RELEASE_API,
            {
                httpsAgent: new https.Agent({rejectUnauthorized: false}),
                headers: GITHUB_HEADERS
            }
        );
        let downloadUrl = response.data.assets[0].browser_download_url;

        downloadUrl = `https://mirror.ghproxy.com/${downloadUrl}`;
        await axios({
            method: "get",
            url: downloadUrl,
            responseType: "stream",
            headers: GITHUB_HEADERS
        }).then(response => {
            return new Promise<void>((resolve, reject) => {
                let writeStream = response.data.pipe(fs.createWriteStream(
                    path.join(DIR_DATA_TEMP, "i18n.zip")
                ))
                writeStream.on('finish', async () => {
                    try {
                        console.log("I18N mod downloaded done!")
                        await this.remoteLoadTest()
                        resolve();
                    } catch (e) {
                        console.error(e);
                        reject(e);
                    }
                });
                writeStream.on('error', (e: any) => {
                    console.error(e);
                    reject(e);
                });
            });
        });
    }

    /**
     * 挪入 ModLoader 中远程加载
     */
    async remoteLoadTest() {
        // 通过填写 modList.json 远程加载模组
        await promisify(fs.copyFile)(
            path.join(DIR_DATA_TEMP, "i18n.zip"),
            path.join(DIR_MODLOADER_BUILT_MODS, "i18n.zip")
        ).catch(err => {});

        await promisify(fs.access)(path.join(DIR_MODLOADER_BUILT_ROOT, `modList.json`)).catch(async (err) => {
            return await promisify(fs.writeFile)(path.join(DIR_MODLOADER_BUILT_ROOT, `modList.json`), JSON.stringify(["mods/i18n.zip"]));
        });
        let modListDataBuffer = await promisify(fs.readFile)(path.join(DIR_MODLOADER_BUILT_ROOT, `modList.json`), 'utf-8');
        let modListData = JSON.parse(modListDataBuffer);
        if (!modListData.includes("mods/i18n.zip")) {
            modListData.push("mods/i18n.zip");
        }

        await promisify(fs.writeFile)(path.join(DIR_MODLOADER_BUILT_ROOT, "modList.json"), JSON.stringify(modListData));
    }
}

/**
 * 处理游戏段落相关，方便比对差异与自动填充
 */
export class ProcessGamePassage {
    constructor(
        public modDir: string
    ) {
    }

    /**
     * 获取所有段落和段落名
     * @param dirPath 目录路径
     * @param name 源码为 source, 其它为模组名
     */
    async getAllPassages(dirPath: string, name: string): Promise<GetAllPassageReturnType> {
        console.log(`Starting to fetch all passages info of ${name} ...`)
        let outputDir = path.join(DIR_DATA_PASSAGE, name);
        await promisify(fs.access)(outputDir).catch(async () => {
            await promisify(fs.mkdir)(outputDir).catch(async (err) => {
                console.error(`ERROR when mkdir of ${outputDir}`);
                return Promise.reject(err);
            })
        })
        let allPassages: AllPassageInfoType = [];
        let allPassagesNames: string[] = [];
        let allPassagesFile = path.join(outputDir, "all_passages.json");
        let allPassagesNamesFile = path.join(outputDir, "all_passages_names.json");

        let allTwineFiles = walk(dirPath, onlyTwineFileFilter);
        for (let file of allTwineFiles) {
            let content = await promisify(fs.readFile)(file).catch(err => {
                return Promise.reject(err)
            });
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

        await promisify(fs.writeFile)(allPassagesFile, JSON.stringify(allPassages)).catch(err => {
            return Promise.reject(err)
        });
        await promisify(fs.writeFile)(allPassagesNamesFile, JSON.stringify(allPassagesNames)).catch(err => {
            return Promise.reject(err)
        });

        console.log(`All passage info of ${name} has been fetched done！${allPassagesNames.length} passages in total.`)
        return [allPassagesNames, allPassages]
    }

    /**
     * 获取源码中的所有段落和段落名
     */
    async getAllPassagesSource(): Promise<GetAllPassageReturnType> {
        let [allPassagesNames, allPassages] = await this.getAllPassages(DIR_GAME_TWINE, "source");
        await this.writePassagesSource(allPassages);
        return [allPassagesNames, allPassages]
    }

    /**
     * 获取模组中的所有段落和段落名
     */
    async getAllPassagesMod(): Promise<GetAllPassageReturnType> {
        let [allPassagesNames, allPassages] = await this.getAllPassages(path.join(DIR_MODS, this.modDir), this.modDir);
        await this.writePassagesMod(allPassages);
        return [allPassagesNames, allPassages]
    }

    /**
     * 获取模组中与源码中都有的段落
     */
    async getSamePassagesMod() {
        let samePassagesNames = [];
        let samePassages = [];
        let outputDir = path.join(DIR_DATA_PASSAGE, this.modDir)
        let samePassagesFile = path.join(outputDir, "same_passages.json");
        let samePassagesNamesFile = path.join(outputDir, "same_passages_names.json");

        let [sourcePassagesNames, sourcePassages] = await this.getAllPassagesSource();
        let [modPassagesNames, modPassages] = await this.getAllPassagesMod();

        console.log("Starting to fetch modified passages' info...");
        for (let passage of modPassages) {
            if (sourcePassagesNames.includes(passage.passageName)) {
                samePassagesNames.push(passage.passageName);
                samePassages.push(passage)
            }
        }

        await promisify(fs.writeFile)(samePassagesFile, JSON.stringify(samePassages)).catch(err => {
            return Promise.reject(err)
        });
        await promisify(fs.writeFile)(samePassagesNamesFile, JSON.stringify(samePassagesNames)).catch(err => {
            return Promise.reject(err)
        });

        console.log(`All modified passages' info have been fetched done! ${samePassagesNames.length} in total.`);
        return {
            name: samePassagesNames,
            passage: samePassages
        }
    }

    /**
     * 把所有段落信息写入文件
     * @param allPassages 获取到所有的段落信息
     * @param name 源码为 source, 其他为模组名
     */
    async writePassages(allPassages: AllPassageInfoType, name: string) {
        let outputDir = path.join(DIR_DATA_PASSAGE, name, "all_passages");
        await promisify(fs.access)(outputDir).catch(async () => {
            await promisify(fs.mkdir)(outputDir).catch(err => {
                console.error(`ERROR when mkdir of ${outputDir}`);
                return Promise.reject(err);
            })
        })

        console.log("Starting to write in passages' info...");
        for (let passage of allPassages) {
            passage.passageName = passage.passageName.replace('/', '_SLASH_');
            let passageFile = path.join(outputDir, `${passage.passageName}.twee`);
            await promisify(fs.writeFile)(passageFile, passage.passageFull).catch(err => {
                return Promise.reject(err)
            });
        }
        console.log("All passages' info have been written done!")
    }

    /**
     * 把源码段落信息写入文件
     * @param allPassages 获取到所有的段落信息
     */
    async writePassagesSource(allPassages: AllPassageInfoType) {
        return await this.writePassages(allPassages, "source")
    }

    /**
     * 把模组段落信息写入文件
     * @param allPassages 获取到所有的段落信息
     */
    async writePassagesMod(allPassages: AllPassageInfoType) {
        return await this.writePassages(allPassages, this.modDir)
    }

    /**
     * 生成 diff 文件
     * @param samePassagesNames 修改过的段落名
     * @param samePassages 修改过的段落完整信息
     */
    async preProcessForDiffGeneration(samePassagesNames: string[], samePassages: PassageInfoType[]) {
        console.log("Starting to process for diff generation ...");
        const bootJsonFilePathSource = path.join(DIR_MODLOADER_REPO_ROOT, "mod", "Diff3WayMerge", "mod", "boot.json");
        const bootJsonFilePath = path.join(DIR_DATA_DIFF, this.modDir, "boot.json");
        const diffModDirs = [
            path.join(DIR_DATA_DIFF, this.modDir, "mod_file"),
            path.join(DIR_DATA_DIFF, this.modDir, "origin_file"),
            path.join(DIR_DATA_DIFF, this.modDir, "patch_diff"),
        ]

        for (const targetDir of diffModDirs) {
            await promisify(fs.access)(targetDir).catch(async () => {
                await promisify(fs.mkdir)(targetDir, {recursive: true}).catch(async (err) => {
                    console.error(`ERROR when mkdir of ${targetDir}`);
                    return Promise.reject(err);
                })
            })
        }

        await promisify(fs.copyFile)(
            bootJsonFilePathSource,
            bootJsonFilePath
        ).catch(e => {});

        for (const passageName of samePassagesNames) {
            await promisify(fs.copyFile)(
                path.join(DIR_DATA_PASSAGE_SOURCE, "all_passages", `${passageName}.twee`),
                path.join(diffModDirs[1], `${passageName}.twee`)
            ).catch(e => {});
        }

        for (const passageInfo of samePassages) {
            const content = passageInfo.passageFull;
            const filePath = path.join(diffModDirs[0], `${passageInfo.passageName}.twee`);
            await promisify(fs.writeFile)(filePath, content).catch(e => {})
        }
        console.log("Processed done!")
    }

    /**
     * 填写 boot.json
     * 逻辑是这样的：
     * 1. diffDataList 中有三种类型的内容：“原文”、“插入”和“删除”
     * 2. 首先，对于 diffDataList 里的内容，两个相邻的内容一定是不同类型的：即一个“插入”不可能和另一个“插入”挨着，一个“原文”不可能和另一个“原文”挨着
     * 3. 其次，只有“原文”可以作为替换参照的字符
     * 4. 然后，遇到“删除”可以直接跳过，因为会被删除，相当于不存在
     *
     * 因此匹配逻辑如下：
     * 1. 对于“原文”直接跳过
     * 2. 对于“插入”和“删除”，可以循环向前向后寻找替换参照，直到到头或者遇到另一个“插入”为止
     * 3. 如果遇到“原文”，就逐字符判断是否在整个段落内是唯一的，如果是就作为替换参照
     * 4. 如果遇到“删除”，不用考虑，因为“删除”会被删除掉，相当于不存在
     * 5. 如果遇到另一个“插入”，则无法再继续寻找，因为无法把“插入”作为替换参照
     * @param samePassagesNames 修改过的段落名
     * @param samePassages 修改过的段落完整信息
     */
    async Diff2BootJson(samePassagesNames: string[], samePassages: PassageInfoType[]) {
        const diffFileDir = path.join(DIR_DATA_DIFF, this.modDir, "patch_diff");
        let replaceParams: TweeReplacerParam[] = [];
        for (const [passageIdx, samePassageName] of samePassagesNames.entries()) {
            const diffFileContent = await promisify(fs.readFile)(path.join(diffFileDir, `${samePassageName}.twee.diff`), 'utf-8');
            const diffDataList: Diff[] = JSON.parse(diffFileContent);

            const passageInfo = samePassages[passageIdx];
            for (let [diffIdx, diffData] of diffDataList.entries()) {
                let findString = "";
                let replace = "";
                switch (diffData.op) {
                    case DiffOperator.EQUAL:
                        continue;
                    case DiffOperator.INSERT:
                        switch (diffIdx) {
                            case 0:
                                // 在开头，直接向前找
                                [findString, replace] = this._insertFindStringForward(diffIdx, diffData, diffDataList, passageInfo, findString, replace);
                                break;
                            case diffDataList.length:
                                // 在末尾，直接往回找
                                [findString, replace] = this._insertFindStringBackward(diffIdx, diffData, diffDataList, passageInfo, findString, replace);
                                break;
                            default:
                                // 先往回找
                                [findString, replace] = this._insertFindStringBackward(diffIdx, diffData, diffDataList, passageInfo, findString, replace);
                                // 往回没找到，再向前找
                                if (findString === "") {
                                    [findString, replace] = this._insertFindStringForward(diffIdx, diffData, diffDataList, passageInfo, findString, replace);
                                }
                        } break;
                    case DiffOperator.DELETE:
                        // 只出现了一次，那直接找这个然后删掉就行
                        if (passageInfo.passageBody.split(diffData.text).length-1 === 1) {
                            findString = diffData.text;
                            break;
                        }
                        switch (diffIdx) {
                            case 0:
                                // 在开头，直接向前找
                                [findString, replace] = this._deleteFindStringForward(diffIdx, diffData, diffDataList, passageInfo, findString, replace);
                                break;
                            case diffDataList.length:
                                // 在末尾，直接往回找
                                [findString, replace] = this._deleteFindStringBackward(diffIdx, diffData, diffDataList, passageInfo, findString, replace);
                                break;
                            default:
                                // 先往回找
                                [findString, replace] = this._deleteFindStringBackward(diffIdx, diffData, diffDataList, passageInfo, findString, replace);
                                // 往回没找到，再向前找
                                if (findString === "") {
                                    [findString, replace] = this._deleteFindStringForward(diffIdx, diffData, diffDataList, passageInfo, findString, replace);
                                }
                        } break;
                }

                if (findString) {
                    replaceParams.push({
                        passage: samePassageName,
                        findString: findString,
                        replace: replace
                    })
                } else {
                    replaceParams.push({
                        passage: samePassageName,
                        findRegex: findString,
                        replace: replace,
                        error: `${diffData.op} | ${diffData.text}`
                    })
                }
            }

            const testFile = path.join(DIR_DATA_DIFF, this.modDir, "test.json");
            await promisify(fs.writeFile)(
                testFile, JSON.stringify(replaceParams)
            ).catch(e => {})
        }
    }

    _deleteFindStringForward(diffIdx: number, diffData: Diff, diffDataList: Diff[], passageInfo: PassageInfoType, findString: string, replace: string) {
        for (let i = 1; diffIdx+i < diffDataList.length; i++) {
            // 如果不是原文就继续向前找
            if (diffDataList[diffIdx+i].op !== DiffOperator.EQUAL) {
                // 都找到下一个要插入的了，还是重复
                if (diffDataList[diffIdx+i].op === DiffOperator.INSERT) break;
                continue;
            }

            let addChar = "";
            for (let char of diffDataList[diffIdx+i].text) {
                addChar = `${addChar}${char}`;
                // 出现了多次
                if (passageInfo.passageBody.split(addChar).length-1 > 1) continue;
                findString = `${diffData.text}${addChar}`;
                replace = addChar;
                break;
            }
        }
        return [findString, replace];
    }

    _deleteFindStringBackward(diffIdx: number, diffData: Diff, diffDataList: Diff[], passageInfo: PassageInfoType, findString: string, replace: string) {
        for (let i = 1; diffIdx-i > 0; i++) {
            // 如果不是原文就继续往回找
            if (diffDataList[diffIdx-i].op !== DiffOperator.EQUAL) {
                // 都找到下一个要插入的了，还是重复
                if (diffDataList[diffIdx-i].op === DiffOperator.INSERT) break;
                continue;
            }

            // 反着加字符
            const text = diffDataList[diffIdx-i].text.split("").reverse().join("");
            let addChar = "";
            for (let char of text) {
                addChar = `${char}${addChar}`;
                // 出现了多次
                if (passageInfo.passageBody.split(addChar).length - 1 > 1) continue;
                findString = `${addChar}${diffData.text}`;
                replace = addChar;
                break;
            }
        }
        return [findString, replace];
    }

    _insertFindStringForward(diffIdx: number, diffData: Diff, diffDataList: Diff[], passageInfo: PassageInfoType, findString: string, replace: string) {
        for (let i = 1; diffIdx+i < diffDataList.length; i++) {
            // 如果不是原文就继续向前找
            if (diffDataList[diffIdx+i].op !== DiffOperator.EQUAL) {
                // 都找到下一个要插入的了，还是重复
                if (diffDataList[diffIdx+i].op === DiffOperator.INSERT) break;
                continue;
            }

            let addChar = "";
            for (let char of diffDataList[diffIdx+i].text) {
                addChar = `${addChar}${char}`;
                // 出现了多次
                if (passageInfo.passageBody.split(addChar).length-1 > 1) continue;
                findString = addChar;
                replace = `${diffData.text}${addChar}`;
                break;
            }
            break;
        }
        return [findString, replace];
    }

    _insertFindStringBackward(diffIdx: number, diffData: Diff, diffDataList: Diff[], passageInfo: PassageInfoType, findString: string, replace: string) {
        for (let i = 1; diffIdx-i > 0; i++) {
            // 如果不是原文就继续往回找
            if (diffDataList[diffIdx-i].op !== DiffOperator.EQUAL) {
                // 都找到下一个要插入的了，还是重复
                if (diffDataList[diffIdx-i].op === DiffOperator.INSERT) break;
                continue;
            }

            // 反着加字符
            const text = diffDataList[diffIdx-i].text.split("").reverse().join("");
            let addChar = "";
            for (let char of text) {
                addChar = `${char}${addChar}`;
                // 出现了多次
                if (passageInfo.passageBody.split(addChar).length-1 > 1) continue;
                findString = addChar;
                replace = `${addChar}${diffData.text}`;
                break;
            }
            break;
        }
        return [findString, replace];
    }
}

/**
 * 打包生成结果相关
 */
export class ProcessGamePackage {
    constructor(
        public modDir: string
    ) {
    }

    bootData?: { [key: string]: any };
    sourceFilesTwine?: string[];
    modFilesTwineAll?: string[];
    modFilesTwineNew?: string[];
    sourceFilesScript?: string[];
    modFilesScriptSpecial?: string[];
    modFilesScriptAll?: string[];
    modFilesScriptNormal?: string[];
    sourceFilesStyle?: string[];
    modFilesStyleAll?: string[];
    modFilesStyleNew?: string[];
    modFilesImg?: string[];
    modFilesAddition?: string[];

    /**
     * 获取模组文件结构
     */
    async fetchModStructure() {
        console.log(`Starting to fetch file structures of mod ${this.modDir} ...`)
        let buffer = await promisify(fs.readFile)(path.join(DIR_MODS, this.modDir, "boot.json")).catch(err => {
        });
        if (!buffer) {
            console.error(`ERROR fetchModStructure() cannot read boot.json of ${path.join(DIR_MODS, this.modDir, "boot.json")}`);
            throw new Error(`ERROR fetchModStructure() cannot read boot.json of ${path.join(DIR_MODS, this.modDir, "boot.json")}`);
        }
        this.bootData = JSON.parse(buffer.toString());
        if (!this.bootData) {
            console.error(`ERROR fetchModStructure() cannot parse boot.json of ${path.join(DIR_MODS, this.modDir, "boot.json")}`);
            throw new Error(`ERROR fetchModStructure() cannot parse boot.json of ${path.join(DIR_MODS, this.modDir, "boot.json")}`);
        }

        this.sourceFilesTwine = walk(path.join(DIR_GAME_REPO_ROOT), onlyTwineFileFilter, true);
        this.modFilesTwineAll = walk(path.join(DIR_MODS, this.modDir), onlyTwineFileFilter, true);
        this.modFilesTwineNew = this.modFilesTwineAll.filter((file) => {
            return !(this.sourceFilesTwine!.indexOf(file) > -1);
        });  // 过滤掉一致的

        this.sourceFilesScript = walk(path.join(DIR_GAME_REPO_ROOT), onlyJSFileFilter, true);
        this.modFilesScriptSpecial = [];

        if (has(this.bootData, "scriptFileList_preload")) {
            this.modFilesScriptSpecial = this.bootData.scriptFileList_preload;
        } else if (has(this.bootData, 'scriptFileList_earlyload')) {
            this.modFilesScriptSpecial = this.modFilesScriptSpecial.concat(this.bootData.scriptFileList_earlyload);
        } else if (has(this.bootData, 'scriptFileList_inject_early')) {
            this.modFilesScriptSpecial = this.modFilesScriptSpecial.concat(this.bootData.scriptFileList_inject_early);
        } else {
            // empty
            this.modFilesScriptSpecial = [];
        }

        this.modFilesScriptAll = walk(path.join(DIR_MODS, this.modDir), onlyJSFileFilter, true);
        this.modFilesScriptNormal = this.modFilesScriptAll.filter((file) => {
            return !(this.modFilesScriptSpecial!.indexOf(file) > -1);
        });  // 过滤掉特殊的
        this.modFilesScriptNormal = this.modFilesScriptNormal.filter((file) => {
            return !(this.sourceFilesScript!.indexOf(file) > -1);
        });  // 过滤掉一致的

        this.sourceFilesStyle = walk(path.join(DIR_GAME_REPO_ROOT), onlyStyleFileFilter, true);
        this.modFilesStyleAll = walk(path.join(DIR_MODS, this.modDir), onlyStyleFileFilter, true);
        this.modFilesStyleNew = this.modFilesStyleAll.filter((file) => {
            return !(this.sourceFilesStyle!.indexOf(file) > -1);
        });  // 过滤掉一致的

        this.modFilesImg = walk(path.join(DIR_MODS, this.modDir), onlyImageFileFilter, true);
        this.modFilesAddition = walk(path.join(DIR_MODS, this.modDir), onlyExtraFileFilter, true);
        this.modFilesAddition = this.modFilesAddition.filter((item) => {
            return item !== "boot.json"
        });
        console.log(`Structure of ${this.modDir} has been fetched done!`)
    }

    /**
     * 辅助填写 boot.json
     */
    async writeBootJson() {
        console.log(`Starting to written boot.json of ${this.modDir} ...`)
        await this.writeBootJsonFileLists();
        await this.writeBootJsonAddons()
        // await promisify(fs.writeFile)(path.join(DIR_RESULTS, this.modDir, "boot.json"), JSON.stringify(this.bootData)).catch(err => {});
        console.log(`boot.json of ${this.modDir} has been written done!`)
    }

    /**
     * 写入 tweeFileList, scriptFileList, styleFileList, imgFileList, additionFile
     */
    async writeBootJsonFileLists() {
        if (!this.bootData) {
            console.error(`ERROR writeBootJsonFileLists() cannot read bootData`);
            throw new Error(`ERROR writeBootJsonFileLists() read find bootData`);
        }
        // FileLists
        if (!this.bootData.tweeFileList) this.bootData.tweeFileList = this.modFilesTwineNew;
        if (!this.bootData.scriptFileList) this.bootData.scriptFileList = this.modFilesScriptNormal;
        if (!this.bootData.styleFileList) this.bootData.styleFileList = this.modFilesStyleNew;
        if (!this.bootData.imgFileList) this.bootData.imgFileList = this.modFilesImg;
        if (!this.bootData.additionFile) this.bootData.additionFile = this.modFilesAddition;
        // console.log(`\t${this.modDir} 模组文件列表已填写完毕！`)
        return this.bootData;
    }

    /**
     * 写入 dependenceInfo, addonPlugin
     */
    async writeBootJsonAddons() {
        if (!this.bootData) {
            console.error(`ERROR writeBootJsonAddons() cannot read bootData`);
            throw new Error(`ERROR writeBootJsonAddons() read find bootData`);
        }
        // 依赖相关
        if (!this.bootData.dependenceInfo) this.bootData.dependenceInfo = DEFAULT_DEPENDENCE_INFO;
        if (!this.bootData.addonPlugin) this.bootData.addonPlugin = DEFAULT_ADDON_PLUGIN;
        // console.log(`\t${this.modDir} 模组依赖列表已填写完毕！`)
        return this.bootData;
    }

    async writeBootJsonTweeReplacer() {
        // twee 文本替换
    }

    async writeBootJsonReplacePatcher() {
        // js/css 文本替换
    }

    /**
     * 打包模组
     */
    async packageMod() {
        if (!this.bootData) {
            console.error(`ERROR packageMod() cannot read bootData`);
            throw new Error(`ERROR packageMod() read find bootData`);
        }
        console.log(`Starting to pack ${this.modDir} ...`)
        let zip = new JSZip();
        for (let fileListRequired of [
            this.modFilesTwineNew!,
            this.modFilesScriptNormal!,
            this.modFilesStyleNew!,
            this.modFilesImg!,
            this.modFilesAddition!,
        ] as string[][]) {
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
        ] as string[][]) {
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
        console.log(`${this.modDir} has been packed done!`)
    }

    /**
     * 通过填写 modList.json 远程加载模组方便测试
     */
    async remoteLoadTest() {
        if (!this.bootData) {
            console.error(`ERROR remoteLoadTest() cannot read bootData`);
            throw new Error(`ERROR remoteLoadTest() read find bootData`);
        }
        await promisify(fs.copyFile)(
            path.join(DIR_RESULTS, `${this.bootData.name}.mod.zip`),
            path.join(DIR_MODLOADER_BUILT_MODS, `${this.bootData.name}.mod.zip`)
        ).catch(err => {
        });
        // await promisify(fs.rename)(
        //     path.join(DIR_RESULTS, `${this.bootData.name}.mod.zip`),
        //     path.join(DIR_MODLOADER_BUILT_MODS, `${this.bootData.name}.mod.zip`)
        // ).catch(err => {
        // });

        await promisify(fs.access)(path.join(DIR_MODLOADER_BUILT_ROOT, `modList.json`)).catch(async (err) => {
            return await promisify(fs.writeFile)(path.join(DIR_MODLOADER_BUILT_ROOT, `modList.json`), JSON.stringify([
                `mods/${this.bootData!.name}.mod.zip`
            ]));
        });
        let modListDataBuffer = await promisify(fs.readFile)(path.join(DIR_MODLOADER_BUILT_ROOT, `modList.json`), 'utf-8');
        let modListData = JSON.parse(modListDataBuffer);
        if (!modListData.includes(`mods/${this.bootData.name}.mod.zip`)) {
            modListData.push(`mods/${this.bootData.name}.mod.zip`);
        }

        await promisify(fs.writeFile)(path.join(DIR_MODLOADER_BUILT_ROOT, `modList.json`), JSON.stringify(modListData));
    }
}
