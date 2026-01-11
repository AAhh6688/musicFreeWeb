import { musicAPI } from '@/api/musicAPI';

export interface Song {
  id: string | number;
  name: string;
  artist: string;
  album?: string;
  duration?: number;
  cover?: string;
  platform: 'netease' | 'qq' | 'kugou' | 'kuwo';
}

export const searchService = {
  // 搜索所有平台
  async searchAll(keyword: string): Promise<Song[]> {
    const results: Song[] = [];

    try {
      // 搜索网易云
      const neteaseResult = await musicAPI.searchNetease(keyword);
      neteaseResult.songs.forEach((song: any) => {
        results.push({
          id: song.id,
          name: song.name,
          artist: song.artists?.[0]?.name || '未知艺术家',
          album: song.album?.name,
          duration: song.duration,
          cover: song.album?.picUrl,
          platform: 'netease'
        });
      });
    } catch (error) {
      console.error('网易云搜索失败:', error);
    }

    try {
      // 搜索 QQ 音乐
      const qqResult = await musicAPI.searchQQ(keyword);
      qqResult.songs.forEach((song: any) => {
        results.push({
          id: song.id,
          name: song.name,
          artist: song.singer?.[0]?.name || song.ar?.[0]?.name || '未知艺术家',
          album: song.album?.name,
          duration: song.duration,
          cover: song.album?.mid,
          platform: 'qq'
        });
      });
    } catch (error) {
      console.error('QQ 音乐搜索失败:', error);
    }

    try {
      // 搜索酷狗
      const kugouResult = await musicAPI.searchKugou(keyword);
      kugouResult.songs.forEach((song: any) => {
        results.push({
          id: song.id,
          name: song.songName,
          artist: song.singerName || '未知艺术家',
          album: song.albumName,
          duration: song.duration,
          cover: song.imgUrl,
          platform: 'kugou'
        });
      });
    } catch (error) {
      console.error('酷狗搜索失败:', error);
    }

    try {
      // 搜索酷我
      const kuwoResult = await musicAPI.searchKuwo(keyword);
      kuwoResult.songs.forEach((song: any) => {
        results.push({
          id: song.id,
          name: song.name,
          artist: song.artist || '未知艺术家',
          album: song.album,
          duration: song.duration,
          cover: song.pic,
          platform: 'kuwo'
        });
      });
    } catch (error) {
      console.error('酷我搜索失败:', error);
    }

    return results;
  },

  // 搜索单个平台
  async searchPlatform(
    keyword: string,
    platform: 'netease' | 'qq' | 'kugou' | 'kuwo'
  ): Promise<Song[]> {
    const results: Song[] = [];

    try {
      let apiResult;

      switch (platform) {
        case 'netease':
          apiResult = await musicAPI.searchNetease(keyword);
          apiResult.songs.forEach((song: any) => {
            results.push({
              id: song.id,
              name: song.name,
              artist: song.artists?.[0]?.name || '未知艺术家',
              album: song.album?.name,
              duration: song.duration,
              cover: song.album?.picUrl,
              platform: 'netease'
            });
          });
          break;

        case 'qq':
          apiResult = await musicAPI.searchQQ(keyword);
          apiResult.songs.forEach((song: any) => {
            results.push({
              id: song.id,
              name: song.name,
              artist: song.singer?.[0]?.name || song.ar?.[0]?.name || '未知艺术家',
              album: song.album?.name,
              duration: song.duration,
              cover: song.album?.mid,
              platform: 'qq'
            });
          });
          break;

        case 'kugou':
          apiResult = await musicAPI.searchKugou(keyword);
          apiResult.songs.forEach((song: any) => {
            results.push({
              id: song.id,
              name: song.songName,
              artist: song.singerName || '未知艺术家',
              album: song.albumName,
              duration: song.duration,
              cover: song.imgUrl,
              platform: 'kugou'
            });
          });
          break;

        case 'kuwo':
          apiResult = await musicAPI.searchKuwo(keyword);
          apiResult.songs.forEach((song: any) => {
            results.push({
              id: song.id,
              name: song.name,
              artist: song.artist || '未知艺术家',
              album: song.album,
              duration: song.duration,
              cover: song.pic,
              platform: 'kuwo'
            });
          });
          break;
      }
    } catch (error) {
      console.error(`${platform} 搜索失败:`, error);
    }

    return results;
  }
};
