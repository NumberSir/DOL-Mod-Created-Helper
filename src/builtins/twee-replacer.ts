/**
 * https://github.com/Lyoko-Jeremie/Degrees-of-Lewdity_Mod_TweeReplacer
 * 自动填写对应参数
 */
import {Addon} from "../models";
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
