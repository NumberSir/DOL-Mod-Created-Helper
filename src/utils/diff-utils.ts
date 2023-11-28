/**
 * 对 diff 文件的处理
 */
import {Diff, DiffOperator, PassageInfoType} from "../models";

export function findStringForward(diffIdx: number, diffData: Diff, diffDataList: Diff[], passageInfo: PassageInfoType, findString: string, replace: string, isDelete: boolean = false) {
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

    if (isDelete) return [replace, findString];  // 删除是把多的删成少的
    return [findString, replace];  // 默认是插入
}
export function findStringBackward(diffIdx: number, diffData: Diff, diffDataList: Diff[], passageInfo: PassageInfoType, findString: string, replace: string, isDelete: boolean = false) {
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

    if (isDelete) return [replace, findString];  // 删除是把多的删成少的
    return [findString, replace];  // 默认是插入
}
export function findStringBothward(diffIdx: number, diffData: Diff, diffDataList: Diff[], passageInfo: PassageInfoType, findString: string, replace: string, isDelete: boolean = false) {
    for (let bIdx = 1; diffIdx-bIdx > 0; bIdx++) {
        // 如果不是原文就继续往回找
        if (diffDataList[diffIdx-bIdx].op !== DiffOperator.EQUAL) {
            // 都找到下一个要插入的了，还是重复
            if (diffDataList[diffIdx-bIdx].op === DiffOperator.INSERT) break;  // 如果这里 break 了，相当于仍然是单侧往回查找，不影响
            continue;
        }

        const text = diffDataList[diffIdx-bIdx].text.split("").reverse().join("");
        let bAddChar = "";

        let noBothFlag = false;
        for (let bChar of text) {
            bAddChar = `${bChar}${bAddChar}`;

            if (noBothFlag) break;
            for (let fIdx = 1; diffIdx+fIdx < diffDataList.length; fIdx++) {
                // 如果不是原文就继续向前找
                if (diffDataList[diffIdx+fIdx].op !== DiffOperator.EQUAL) {
                    // 都找到下一个要插入的了，还是重复
                    if (diffDataList[diffIdx+fIdx].op === DiffOperator.INSERT) {
                        // 如果这里 break 了，相当于仍然是单侧往回查找，没意义，直接结束
                        noBothFlag = true;
                        break;
                    }
                    continue;
                }

                let fAddChar = "";
                let addChar = "";
                for (let fChar of diffDataList[diffIdx+fIdx].text) {
                    fAddChar = `${fAddChar}${fChar}`;

                    addChar = `${bAddChar}${fAddChar}`
                    // 出现了多次
                    if (passageInfo.passageBody.split(addChar).length-1 > 1) continue;
                    findString = addChar;
                    replace = `${bAddChar}${diffData.text}${fAddChar}`;
                    break;
                }
                break;

            }
        }
    }
    if (isDelete) return [replace, findString];
    return [findString, replace];
}

export function insertFindStringForward(diffIdx: number, diffData: Diff, diffDataList: Diff[], passageInfo: PassageInfoType, findString: string, replace: string) {
    return findStringForward(diffIdx, diffData, diffDataList, passageInfo, findString, replace)
}
export function insertFindStringBackward(diffIdx: number, diffData: Diff, diffDataList: Diff[], passageInfo: PassageInfoType, findString: string, replace: string) {
    return findStringBackward(diffIdx, diffData, diffDataList, passageInfo, findString, replace)
}
export function insertFindStringBothward(diffIdx: number, diffData: Diff, diffDataList: Diff[], passageInfo: PassageInfoType, findString: string, replace: string) {
    return findStringBothward(diffIdx, diffData, diffDataList, passageInfo, findString, replace)
}

export function deleteFindStringForward(diffIdx: number, diffData: Diff, diffDataList: Diff[], passageInfo: PassageInfoType, findString: string, replace: string) {
    return findStringForward(diffIdx, diffData, diffDataList, passageInfo, findString, replace, true)
}
export function deleteFindStringBackward(diffIdx: number, diffData: Diff, diffDataList: Diff[], passageInfo: PassageInfoType, findString: string, replace: string) {
    return findStringBackward(diffIdx, diffData, diffDataList, passageInfo, findString, replace, true)
}
export function deleteFindStringBothward(diffIdx: number, diffData: Diff, diffDataList: Diff[], passageInfo: PassageInfoType, findString: string, replace: string) {
    return findStringBothward(diffIdx, diffData, diffDataList, passageInfo, findString, replace, true)
}
