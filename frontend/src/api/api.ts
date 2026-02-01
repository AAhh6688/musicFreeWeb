// 补充必要的类型定义（若项目已有IMusic/MusicPlugin定义，可删除此段）
declare namespace IMusic {
  interface IMusicItem {
    id: string;
    name: string;
    singer: string;
    url: string;
    platform: string;
    [key: string]: any;
  }

  type IQualityKey = '128k' | '320k' | 'flac' | 'ape';

  interface Lyric {
    lyric: string; // 普通歌词
    tlyric?: string; // 翻译歌词（可选）
  }
}

import { MusicPlugin } from './type';

// 1. 配置你提供的所有音源API地址
const PLUGIN_SOURCES = [
  'https://musicfreepluginshub.2020818.xyz/plugins.json',
  'https://fastly.jsdelivr.net/gh/Huibq/keep-alive/Music_Free/myPlugins.json',
  'https://gitlab.com/acoolbook/musicfree/-/raw/main/music.json',
  'https://raw.githubusercontent.com/maotoumao/MusicFreePlugins/master/plugins.json',
  'https://cdn.jsdelivr.net/gh/maotoumao/MusicFreePlugins@master/kuwo.js',
  'https://cdn.jsdelivr.net/gh/maotoumao/MusicFreePlugins@master/netease.js',
  'https://cdn.jsdelivr.net/gh/maotoumao/MusicFreePlugins@master/qq.js'
];

// 2. 通用请求函数：实现「失败自动切换音源」核心逻辑
const fetchWithFallback = async <T>(urls: string[], options?: RequestInit): Promise<T> => {
  let lastError: Error;
  // 遍历所有音源地址，一个失败则切换下一个
  for (const url of urls) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`请求失败: ${res.status}`);
      // 区分JSON文件和JS插件文件的返回格式
      if (url.endsWith('.js')) {
        const jsContent = await res.text();
        return jsContent as unknown as T;
      } else {
        const data = await res.json();
        return data as T;
      }
    } catch (err) {
      lastError = err as Error;
      console.log(`音源 ${url} 失败，切换下一个:`, lastError.message);
    }
  }
  // 所有音源都失败，抛出最终错误
  throw new Error(`所有音源请求失败：${lastError?.message || '未知错误'}`);
};

// 原有基础地址（保留，兼容其他接口）
const baseURL = process.env.API_BASE_URL || '';

// ===================== 核心功能函数（修改/新增） =====================
/**
 * 获取插件列表（多音源自动切换）
 */
export const getPlugins = (): Promise<MusicPlugin[]> => {
  // 只请求.json后缀的插件列表地址（过滤单个JS插件）
  const pluginJsonUrls = PLUGIN_SOURCES.filter(url => url.endsWith('.json'));
  return fetchWithFallback<MusicPlugin[]>(pluginJsonUrls);
};

/**
 * 获取单个插件（如酷我/网易云/QQ的JS插件，失败自动切换）
 */
export const getSinglePlugin = (pluginName: 'kuwo' | 'netease' | 'qq'): Promise<string> => {
  const pluginUrls = {
    kuwo: ['https://cdn.jsdelivr.net/gh/maotoumao/MusicFreePlugins@master/kuwo.js'],
    netease: ['https://cdn.jsdelivr.net/gh/maotoumao/MusicFreePlugins@master/netease.js'],
    qq: ['https://cdn.jsdelivr.net/gh/maotoumao/MusicFreePlugins@master/qq.js']
  };
  return fetchWithFallback<string>(pluginUrls[pluginName]);
};

/**
 * 安装插件（保留原有逻辑）
 */
export const installPlugins = (url: string) => {
  return fetch(`${baseURL}/plugins`, {
    method: 'POST',
    body: JSON.stringify({ url }),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json());
};

/**
 * 卸载插件（保留原有逻辑）
 */
export const uninstallPlugin = (hash: string) => {
  return fetch(`${baseURL}/plugin/${hash}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json());
};

/**
 * 获取支持指定方法的插件（多音源切换）
 */
export const supportPlugins = (method: string): Promise<MusicPlugin[]> => {
  const supportUrls = PLUGIN_SOURCES.filter(url => url.endsWith('.json')).map(url => {
    const base = url.replace('/plugins.json', '');
    return `${base}/plugins/support/${method}`;
  });
  return fetchWithFallback<MusicPlugin[]>(supportUrls);
};

/**
 * 获取可搜索的插件（多音源切换）
 */
export const searchablePlugins = (method: string): Promise<MusicPlugin[]> => {
  const searchableUrls = PLUGIN_SOURCES.filter(url => url.endsWith('.json')).map(url => {
    const base = url.replace('/plugins.json', '');
    return `${base}/plugins/searchable/${method}`;
  });
  return fetchWithFallback<MusicPlugin[]>(searchableUrls);
};

/**
 * 根据Hash获取插件（多音源切换）
 */
export const getPluginByHash = (hash: string): Promise<MusicPlugin> => {
  const pluginHashUrls = PLUGIN_SOURCES.filter(url => url.endsWith('.json')).map(url => {
    const base = url.replace('/plugins.json', '');
    return `${base}/plugin/${hash}`;
  });
  return fetchWithFallback<MusicPlugin>(pluginHashUrls);
};

/**
 * 获取排行榜（多音源切换）
 */
export const getTopLists = (hash: string) => {
  const topListUrls = PLUGIN_SOURCES.filter(url => url.endsWith('.json')).map(url => {
    const base = url.replace('/plugins.json', '');
    return `${base}/top?hash=${hash}`;
  });
  return fetchWithFallback<any>(topListUrls);
};

/**
 * 获取排行榜详情（多音源切换）
 */
export const getTopListDetail = (platform: string, item: any, page: number) => {
  const body = JSON.stringify({
    page: page.toString(),
    name: platform,
    data: JSON.stringify(item),
  });
  const topDetailUrls = PLUGIN_SOURCES.filter(url => url.endsWith('.json')).map(url => {
    const base = url.replace('/plugins.json', '');
    return `${base}/top/detail`;
  });
  return fetchWithFallback<any>(topDetailUrls, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' }
  });
};

/**
 * 获取音乐播放源（核心：播放失败自动切换音源）
 */
export const getMusicSource = async (musicItem: IMusic.IMusicItem, quality: IMusic.IQualityKey): Promise<IMusic.IMusicItem> => {
  const musicSourceUrls = PLUGIN_SOURCES.filter(url => url.endsWith('.json')).map(url => {
    const base = url.replace('/plugins.json', '');
    return `${base}/music`;
  });

  let lastError: Error;
  // 遍历每个音源，验证播放地址是否有效
  for (const url of musicSourceUrls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ quality, data: JSON.stringify(musicItem) }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`状态码: ${res.status}`);
      
      const data = await res.json();
      // 校验是否有有效播放地址
      if (data?.url && data.url.startsWith('http')) {
        return data; // 找到有效音源，直接返回
      } else {
        throw new Error('无有效播放地址');
      }
    } catch (err) {
      lastError = err as Error;
      console.log(`音源 ${url} 播放失败:`, lastError.message);
    }
  }
  throw new Error(`所有音源播放失败：${lastError?.message || '未知错误'}`);
};

/**
 * 获取歌词（新增：显示歌词核心函数）
 */
export const getLyric = async (musicItem: IMusic.IMusicItem): Promise<IMusic.Lyric> => {
  // 解析LRC歌词格式（适配大多数音源的歌词返回格式）
  const parseLrc = (lrcText: string) => {
    const lines = lrcText.split('\n');
    const plainLyric: string[] = [];
    lines.forEach(line => {
      const reg = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
      const match = line.match(reg);
      if (match && match[4].trim()) {
        plainLyric.push(match[4].trim());
      }
    });
    return plainLyric.join('\n'); // 转为纯文本歌词
  };

  const lyricUrls = PLUGIN_SOURCES.filter(url => url.endsWith('.json')).map(url => {
    const base = url.replace('/plugins.json', '');
    return `${base}/lyric`;
  });

  let lastError: Error;
  for (const url of lyricUrls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ data: JSON.stringify(musicItem) }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`状态码: ${res.status}`);
      
      const lyricData = await res.json();
      if (lyricData?.lyric) {
        return {
          lyric: parseLrc(lyricData.lyric), // 解析LRC为纯文本
          tlyric: lyricData.tlyric ? parseLrc(lyricData.tlyric) : ''
        };
      } else {
        throw new Error('无歌词数据');
      }
    } catch (err) {
      lastError = err as Error;
      console.log(`音源 ${url} 获取歌词失败:`, lastError.message);
    }
  }
  throw new Error(`所有音源无歌词：${lastError?.message || '未知错误'}`);
};

/**
 * 搜索音乐（多音源切换）
 */
export const searchMusic = async (hash: string, query: string, page: number, type: string) => {
  const body = JSON.stringify({ query, hash, page: page.toString(), type });
  const searchUrls = PLUGIN_SOURCES.filter(url => url.endsWith('.json')).map(url => {
    const base = url.replace('/plugins.json', '');
    return `${base}/search`;
  });
  return fetchWithFallback<any>(searchUrls, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' }
  });
};

/**
 * 获取推荐歌单标签（多音源切换）
 */
export const getRecommendSheetTags = (hash: string) => {
  const recommendTagUrls = PLUGIN_SOURCES.filter(url => url.endsWith('.json')).map(url => {
    const base = url.replace('/plugins.json', '');
    return `${base}/recommend/${hash}`;
  });
  return fetchWithFallback<any>(recommendTagUrls);
};

/**
 * 根据标签获取推荐歌单（多音源切换）
 */
export const getRecommendSheetByTag = (hash: string, tag: any, page: number) => {
  const recommendSheetUrls = PLUGIN_SOURCES.filter(url => url.endsWith('.json')).map(url => {
    const base = url.replace('/plugins.json', '');
    return `${base}/recommend/${hash}/${JSON.stringify(tag)}?page=${page}`;
  });
  return fetchWithFallback<any>(recommendSheetUrls);
};

/**
 * 获取歌单信息（多音源切换）
 */
export const getMusicSheetInfo = (item: any, page: number) => {
  const sheetInfoUrls = PLUGIN_SOURCES.filter(url => url.endsWith('.json')).map(url => {
    const base = url.replace('/plugins.json', '');
    return `${base}/music-sheet?item=${JSON.stringify(item)}&page=${page}`;
  });
  return fetchWithFallback<any>(sheetInfoUrls);
};
