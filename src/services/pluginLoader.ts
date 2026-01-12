// 插件加载器 - 加载和管理音乐源插件
export interface SongItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover: string;
  platform: string;
  platformId: string;
  url?: string;
  lyric?: string;
}

export interface MusicPlugin {
  name: string;
  version: string;
  platform: string;
  description?: string;
  apiServers: string[];
  searchApi: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    dataPath: string;
    itemMapping: Record<string, string>;
  };
  playUrlApi?: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    dataPath: string;
  };
  lyricApi?: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    dataPath: string;
  };
}

class PluginLoader {
  private plugins: Map<string, MusicPlugin> = new Map();
  private pluginManifest: any = null;

  // 加载插件清单
  async loadManifest(): Promise<void> {
    try {
      const response = await fetch('/plugins/manifest.json');
      if (!response.ok) throw new Error('Failed to load manifest');
      this.pluginManifest = await response.json();
    } catch (error) {
      console.error('Failed to load plugin manifest:', error);
      throw error;
    }
  }

  // 加载单个插件
  async loadPlugin(pluginUrl: string): Promise<MusicPlugin> {
    try {
      const response = await fetch(pluginUrl);
      if (!response.ok) throw new Error(`Failed to load plugin: ${pluginUrl}`);
      const plugin = await response.json();
      this.plugins.set(plugin.platform, plugin);
      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin from ${pluginUrl}:`, error);
      throw error;
    }
  }

  // 加载所有插件
  async loadAllPlugins(): Promise<MusicPlugin[]> {
    try {
      await this.loadManifest();
      const plugins: MusicPlugin[] = [];

      if (this.pluginManifest?.plugins) {
        for (const pluginInfo of this.pluginManifest.plugins) {
          try {
            const plugin = await this.loadPlugin(pluginInfo.url);
            plugins.push(plugin);
          } catch (error) {
            console.warn(`Failed to load plugin ${pluginInfo.name}:`, error);
          }
        }
      }

      return plugins;
    } catch (error) {
      console.error('Failed to load all plugins:', error);
      throw error;
    }
  }

  // 获取插件
  getPlugin(platform: string): MusicPlugin | undefined {
    return this.plugins.get(platform);
  }

  // 获取所有插件
  getAllPlugins(): MusicPlugin[] {
    return Array.from(this.plugins.values());
  }

  // 搜索歌曲
  async search(keyword: string, platform: string): Promise<SongItem[]> {
    const plugin = this.getPlugin(platform);
    if (!plugin) throw new Error(`Plugin ${platform} not found`);

    return this.searchWithPlugin(plugin, keyword);
  }

  // 使用插件搜索
  private async searchWithPlugin(plugin: MusicPlugin, keyword: string): Promise<SongItem[]> {
    const { apiServers, searchApi } = plugin;

    for (const apiServer of apiServers) {
      try {
        const url = apiServer + searchApi.url.replace('{keyword}', encodeURIComponent(keyword));

        const response = await fetch(url, {
          method: searchApi.method,
          headers: searchApi.headers || {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) continue;

        const data = await response.json();
        const songs = this.extractData(data, searchApi.dataPath);

        if (Array.isArray(songs)) {
          return songs.map((song: any) => this.mapSongItem(song, searchApi.itemMapping, plugin.platform));
        }
      } catch (error) {
        console.warn(`Search failed with API ${apiServer}:`, error);
        continue;
      }
    }

    throw new Error(`All APIs failed for platform ${plugin.platform}`);
  }

  // 提取数据
  private extractData(data: any, path: string): any {
    const keys = path.split('.');
    let result = data;

    for (const key of keys) {
      if (result && typeof result === 'object') {
        result = result[key];
      } else {
        return null;
      }
    }

    return result;
  }

  // 映射歌曲项
  private mapSongItem(song: any, mapping: Record<string, string>, platform: string): SongItem {
    const item: any = {
      platform,
      url: '',
      lyric: ''
    };

    for (const [key, path] of Object.entries(mapping)) {
      item[key] = this.extractData(song, path);
    }

    return item as SongItem;
  }

  // 获取播放 URL
  async getPlayUrl(songItem: SongItem): Promise<string> {
    const plugin = this.getPlugin(songItem.platform);
    if (!plugin || !plugin.playUrlApi) throw new Error('Plugin or playUrlApi not found');

    const { apiServers, playUrlApi } = plugin;

    for (const apiServer of apiServers) {
      try {
        let url = apiServer + playUrlApi.url;
        url = url.replace('{id}', songItem.platformId);

        const response = await fetch(url, {
          method: playUrlApi.method,
          headers: playUrlApi.headers || {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) continue;

        const data = await response.json();
        const playUrl = this.extractData(data, playUrlApi.dataPath);

        if (playUrl) {
          return playUrl;
        }
      } catch (error) {
        console.warn(`Get play URL failed with API ${apiServer}:`, error);
        continue;
      }
    }

    throw new Error('Failed to get play URL');
  }

  // 获取歌词
  async getLyric(songItem: SongItem): Promise<string> {
    const plugin = this.getPlugin(songItem.platform);
    if (!plugin || !plugin.lyricApi) return '';

    const { apiServers, lyricApi } = plugin;

    for (const apiServer of apiServers) {
      try {
        let url = apiServer + lyricApi.url;
        url = url.replace('{id}', songItem.platformId);

        const response = await fetch(url, {
          method: lyricApi.method,
          headers: lyricApi.headers || {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) continue;

        const data = await response.json();
        const lyric = this.extractData(data, lyricApi.dataPath);

        if (lyric) {
          return lyric;
        }
      } catch (error) {
        console.warn(`Get lyric failed with API ${apiServer}:`, error);
        continue;
      }
    }

    return '';
  }
}

export const pluginLoader = new PluginLoader();
