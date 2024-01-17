import {Boot, Addon, Dependence} from "../models";

/**
 * 自动填写 boot.json 文件
 * @param AuthorBoot 作者自己写的 boot 内容
 */
export function autoGenerateBootJson(AuthorBoot: Boot): Boot {
    let resultBoot: Boot = {
        name: "",
        version: "",
        scriptFileList: [],
        styleFileList: [],
        tweeFileList: [],
        imgFileList: [],
        additionFile: [],

        additionBinaryFile: [],
        additionDir: [],
        addonPlugin: [],
        dependenceInfo: [],
        scriptFileList_earlyload: [],
        scriptFileList_inject_early: [],
        scriptFileList_preload: [],
    };

    if (AuthorBoot.additionBinaryFile !== undefined) {
        resultBoot.additionBinaryFile = AuthorBoot.additionBinaryFile;
    }
    if (AuthorBoot.additionDir !== undefined) {
        resultBoot.additionDir = AuthorBoot.additionDir;
    }
    if (AuthorBoot.addonPlugin !== undefined) {
        resultBoot.addonPlugin = AuthorBoot.addonPlugin;
    }
    if (AuthorBoot.dependenceInfo !== undefined) {
        resultBoot.dependenceInfo = AuthorBoot.dependenceInfo;
    }
    if (AuthorBoot.scriptFileList_earlyload !== undefined) {
        resultBoot.scriptFileList_earlyload = AuthorBoot.scriptFileList_earlyload;
    }
    if (AuthorBoot.scriptFileList_inject_early !== undefined) {
        resultBoot.scriptFileList_inject_early = AuthorBoot.scriptFileList_inject_early;
    }
    if (AuthorBoot.scriptFileList_preload !== undefined) {
        resultBoot.scriptFileList_preload = AuthorBoot.scriptFileList_preload;
    }
    return resultBoot;
}