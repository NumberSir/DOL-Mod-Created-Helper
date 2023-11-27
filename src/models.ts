/**
 * 处理段落信息，方便差异比对
 */
export interface PassageInfoType {
    passageName: string;  // 段落名称 - :: PASSAGE_NAME [xxx]
    passageBody: string;  // 段落内容，不含段落名称
    passageFull: string;  // 包含段落名称的整个段落
    filepath: string;     // 文件路径
    filename: string;     // 文件名
}

export type AllPassageInfoType = PassageInfoType[];
export type GetAllPassageReturnType = [string[], PassageInfoType[]];

export interface Diff {
    op: number;
    text: string
}

export enum DiffOperator {
    EQUAL,
    INSERT,
    DELETE = -1
}

export interface Addon {
    modName: string;
    addonName: string;
    modVersion: string;
    params: object[];
}

export interface Dependence {
    modName: string;
    version: string;
}
