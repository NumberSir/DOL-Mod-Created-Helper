import path from "path";

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

/**
 * diff 文件基本结构
 */
export interface Diff {
    op: number;
    text: string
}

export enum DiffOperator {
    EQUAL,
    INSERT,
    DELETE = -1
}

/**
 * boot -> addonPlugin
 */
export interface Addon {
    modName: string;    // 插件来自哪个模组
    addonName: string;  // 在那个模组中的插件名
    modVersion: string; // 插件所在模组的版本
    params?: any[];     // 插件参数
}

/**
 * boot -> dependenceInfo
 */
export interface Dependence {
    modName: string;    // 依赖的模组名称
    version: string;    // 依赖的模组版本
}

/**
 * boot.json 基本结构
 */
export interface Boot {
    name: string;       // 模组名称
    version: string;    // 模组版本

    scriptFileList: string[];   // js 脚本文件，这是游戏的一部分
    styleFileList: string[];    // css 样式文件
    tweeFileList: string[];     // twee 剧本文件
    imgFileList: string[];      // 图片文件，尽可能不要用容易与文件中其他字符串混淆的文件路径，否则会意外破坏文件内容
    additionFile: string[];     // 附加文件列表，额外打包到 zip 中的文件，此列表中的文件不会被加载，仅作为附加文件存在。注意这里的文件会以被当作文本文件以 utf-8 编码读取并保存。这里第一个以 readme(不区分大小写)开头的文件会被作为模组的说明文件，会在模组管理器中显示

    scriptFileList_inject_early?: string[]; // 提前注入的 js 脚本，会在当前模组加载后立即插入到 dom 中由浏览器按照 <script> 的标注执行方式执行
    scriptFileList_earlyload?: string[];    // 提前加载的 js 脚本，会在当前模组加载后，inject_early 脚本全部插入完成后，由 modloader 执行并等待异步指令返回，可以在这里读取到未修改的 Passage 的内容
    scriptFileList_preload?: string[];      // 预加载的 js 脚本文件，会在引擎初始化前、模组的数据文件全部加载并合并到 html 的 <tw-storydata> 中后，由 modloader 执行并等待异步指令返回， 可以在此处调用 modloader 的 API 读取最新的 Passage 数据并动态修改覆盖 Passage 的内容

    additionBinaryFile?: string[];  // 如果有需要附加的二进制文件，编写在这里时 packModZip.ts 会将其以二进制格式保存
    additionDir?: string[];         // 如果有需要附加的文件夹，编写在这里时 packModZip.ts 会将其下所有问题以二进制格式保存

    addonPlugin?: Addon[];          // 依赖的插件列表，在此声明本模组依赖哪些插件，在此处声明后会调用对应的插件，不满足的依赖会在加载日志中产生警告
    dependenceInfo?: Dependence[];  // 依赖的模组列表，可以在此声明此模组依赖哪些前置模组，不满足的依赖会在加载日志中产生警告
}
