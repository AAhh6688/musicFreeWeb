import {MusicPlugin} from './type';

// API基础URL配置
const baseURL = process.env.API_BASE_URL || ''

// ============================================
// 预设的音源插件列表
// ============================================
export const PRESET_PLUGIN_URLS = [
    // 插件仓库地址
    'https://musicfreepluginshub.2020818.xyz/plugins.json',
    'https://fastly.jsdelivr.net/gh/Huibq/keep-alive/Music_Free/myPlugins.json',
    'https://gitlab.com/acoolbook/musicfree/-/raw/main/music.json',
    'https://raw.githubusercontent.com/maotoumao/MusicFreePlugins/master/plugins.json',
    
    // 单个插件地址
    'https://cdn.jsdelivr.net/gh/maotoumao/MusicFreePlugins@master/kuwo.js',
    'https://cdn.jsdelivr.net/gh/maotoumao/MusicFreePlugins@master/netease.js',
    'https://cdn.jsdelivr.net/gh/maotoumao/MusicFreePlugins@master/qq.js',
];

// ============================================
// 插件管理相关API
// ============================================

/**
 * 获取所有已安装的插件
 */
export const getPlugins = (): Promise<MusicPlugin[]> => {
    return fetch(`${baseURL}/plugins`).then(res => res.json())
}

/**
 * 安装单个插件
 * @param url 插件的URL地址
 */
export const installPlugin = (url: string) => {
    return fetch(`${baseURL}/plugins`, {
        method: 'POST',
        body: JSON.stringify({url}),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
}

/**
 * 批量安装预设的所有插件
 * 这个函数会逐个安装PRESET_PLUGIN_URLS中的所有插件
 */
export const installAllPresetPlugins = async () => {
    const results = [];
    
    for (const url of PRESET_PLUGIN_URLS) {
        try {
            console.log(`正在安装插件: ${url}`);
            const result = await installPlugin(url);
            results.push({
                url,
                success: true,
                result
            });
        } catch (error) {
            console.error(`安装失败: ${url}`, error);
            results.push({
                url,
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }
    
    return results;
}

/**
 * 卸载插件
 * @param hash 插件的hash值
 */
export const uninstallPlugin = (hash: string) => {
    return fetch(`${baseURL}/plugin/${hash}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
}

/**
 * 获取支持特定方法的插件列表
 * @param method 方法名称
 */
export const supportPlugins = (method: string): Promise<MusicPlugin[]> => {
    return fetch(`${baseURL}/plugins/support/${method}`).then(res => res.json())
}

/**
 * 获取可搜索的插件列表
 * @param method 方法名称
 */
export const searchablePlugins = (method: string): Promise<MusicPlugin[]> => {
    return fetch(`${baseURL}/plugins/searchable/${method}`).then(res => res.json())
}

/**
 * 根据hash获取插件信息
 * @param hash 插件的hash值
 */
export const getPluginByHash = (hash: string): Promise<MusicPlugin> => {
    return fetch(`${baseURL}/plugin/${hash}`).then(res => res.json())
}

// ============================================
// 排行榜相关API
// ============================================

/**
 * 获取排行榜列表
 * @param hash 插件hash
 */
export const getTopLists = (hash: string) => {
    return fetch(`${baseURL}/top?hash=${hash}`).then(res => res.json())
}

/**
 * 获取排行榜详情
 * @param platform 平台名称
 * @param item 榜单项
 * @param page 页码
 */
export const getTopListDetail = (platform: string, item: any, page: number) => {
    return fetch(`${baseURL}/top/detail`, {
        method: 'POST',
        body: JSON.stringify({
            page: page.toString(),
            name: platform,
            data: JSON.stringify(item),
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
}

// ============================================
// 音乐相关API
// ============================================

/**
 * 获取音乐播放源
 * @param musicItem 音乐项
 * @param quality 音质等级
 */
export const getMusicSource = (musicItem: IMusic.IMusicItem, quality: IMusic.IQualityKey) => {
    return fetch(`${baseURL}/music`, {
        method: 'POST',
        body: JSON.stringify({
            quality,
            data: JSON.stringify(musicItem),
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
}

/**
 * 搜索音乐
 * @param hash 插件hash
 * @param query 搜索关键词
 * @param page 页码
 * @param type 搜索类型
 */
export const searchMusic = (hash: string, query: string, page: number, type: string) => {
    return fetch(`${baseURL}/search`, {
        method: 'POST',
        body: JSON.stringify({
            query,
            hash,
            page: page.toString(),
            type,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
}

// ============================================
// 推荐歌单相关API
// ============================================

/**
 * 获取推荐歌单标签
 * @param hash 插件hash
 */
export const getRecommendSheetTags = (hash: string) => {
    return fetch(`${baseURL}/recommend/${hash}`).then(res => res.json())
}

/**
 * 根据标签获取推荐歌单
 * @param hash 插件hash
 * @param tag 标签
 * @param page 页码
 */
export const getRecommendSheetByTag = (hash: string, tag: any, page: number) => {
    return fetch(`${baseURL}/recommend/${hash}/${JSON.stringify(tag)}?page=${page}`).then(res => res.json())
}

/**
 * 获取歌单信息
 * @param item 歌单项
 * @param page 页码
 */
export const getMusicSheetInfo = (item: any, page: number) => {
    return fetch(`${baseURL}/music-sheet?item=${JSON.stringify(item)}&page=${page}`).then(res => res.json())
}

// ============================================
// 使用示例
// ============================================

/**
 * 示例：初始化应用时自动安装所有预设插件
 */
export const initializeApp = async () => {
    console.log('开始安装预设插件...');
    const results = await installAllPresetPlugins();
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`插件安装完成！成功: ${successCount}, 失败: ${failCount}`);
    
    return results;
}
