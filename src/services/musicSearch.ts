// 音乐搜索服务
import { pluginLoader, type SongItem } from './pluginLoader';

export class MusicSearchService {
  private currentPlatform: string = 'netease';

  // 初始化
  async initialize(): Promise<void> {
    try {
      await pluginLoader.loadAllPlugins();
      console.log('Plugins loaded successfully');
    } catch (error) {
      console.error('Failed to initialize music search service:', error);
      throw error;
    }
  }

  // 设置当前平台
  setPlatform(platform: string): void {
    this.currentPlatform = platform;
  }

  // 获取当前平台
  getPlatform(): string {
    return this.currentPlatform;
  }

  // 获取所有平台
  getAllPlatforms(): string[] {
    return pluginLoader.getAllPlugins().map(p => p.platform);
  }

  // 搜索歌曲
  async search(keyword: string): Promise<SongItem[]> {
    if (!keyword.trim()) {
      return [];
    }

    try {
      return await pluginLoader.search(keyword, this.currentPlatform);
    } catch (error) {
      console.error(`Search failed for platform ${this.currentPlatform}:`, error);
      throw error;
    }
  }

  // 跨平台搜索
  async searchAll(keyword: string): Promise<Map<string, SongItem[]>> {
    if (!keyword.trim()) {
      return new Map();
    }

    const results = new Map<string, SongItem[]>();
    const platforms = this.getAllPlatforms();

    for (const platform of platforms) {
      try {
        const songs = await pluginLoader.search(keyword, platform);
        results.set(platform, songs);
      } catch (error) {
        console.warn(`Search failed for platform ${platform}:`, error);
        results.set(platform, []);
      }
    }

    return results;
  }

  // 获取播放 URL
  async getPlayUrl(songItem: SongItem): Promise<string> {
    try {
      return await pluginLoader.getPlayUrl(songItem);
    } catch (error) {
      console.error('Failed to get play URL:', error);
      throw error;
    }
  }

  // 获取歌词
  async getLyric(songItem: SongItem): Promise<string> {
    try {
      return await pluginLoader.getLyric(songItem);
    } catch (error) {
      console.warn('Failed to get lyric:', error);
      return '';
    }
  }
}

export const musicSearchService = new MusicSearchService();
