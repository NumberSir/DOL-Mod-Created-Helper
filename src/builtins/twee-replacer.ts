/**
 * https://github.com/Lyoko-Jeremie/Degrees-of-Lewdity_Mod_TweeReplacer
 * 自动填写对应参数
 */
import {Addon, Dependence, PassageInfoType} from "../models";
import {getBuiltInAddonVersion} from "../utils/https-utils"
import {URL_ADDON_TWEE_REPLACER_BOOT} from "../consts";


export interface TweeReplacerParam {
    passage: string;        // 段落名称
    findString?: string;
    findRegex?: string;     // 二选一，字符串或正则
    replace?: string;
    replaceFile?: string;   // 二选一，文件或字符串
    debug?: boolean;         // 是否输出到控制台查看
    all?: boolean;           // 是否把能找到的全部替换
    error?: string;         // 找不到时填入原文
}


export interface AddonTweeReplacer extends Addon {
    params: TweeReplacerParam[]
}


class TweeReplacer {
    modName: string = "TweeReplacer"
    addonName: string = `${this.modName}Addon`
    version: string = "1.0.0";
    alreadyAddonPlugin: AddonTweeReplacer;
    alreadyDependenceInfo: Dependence;

    constructor(addonPlugin: AddonTweeReplacer, dependenceInfo: Dependence) {
        this.alreadyAddonPlugin = addonPlugin;
        this.alreadyDependenceInfo = dependenceInfo;
    }

    /**
     * 获取插件版本
     */
    async getVersion(): Promise<string> {
         this.version = await getBuiltInAddonVersion(URL_ADDON_TWEE_REPLACER_BOOT);
         return this.version;
    }

    /**
     * 填写 boot.json
     */
    async build() {
        await this.getVersion();
        const addonPlugin = await this.buildAddonPlugin();
        const dependenceInfo = await this.buildDependenceInfo();
    }

    /**
     * 填写 AddonPlugin 部分
     */
    async buildAddonPlugin(): Promise<AddonTweeReplacer|void> {
        // 已经有了就别做了
        if (this.alreadyAddonPlugin) return this.alreadyAddonPlugin;

        let resultAddon = {
            modName: this.modName,
            addonName: this.addonName,
            modVersion: this.version
        }


        // return resultAddon;
    }

    /**
     * 找到每个相同段落的差异，自动填写
     */
    buildTweeReplacerParams(
        samePassagesNames: string[], samePassages: PassageInfoType[],
        sourcePassageNames: string[], sourcePassages: PassageInfoType[]) {

    }

    /**
     * 填写 DependenceInfo 部分
     */
    async buildDependenceInfo(): Promise<Dependence> {
        // 已经有了就别做了
        if (this.alreadyDependenceInfo) return this.alreadyDependenceInfo;

        return {
            modName: this.modName,
            version: this.version
        }
    }
}