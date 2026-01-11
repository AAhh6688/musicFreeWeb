// ===== 音乐 API 配置 =====
export const MUSIC_APIS = {
  // 网易云音乐 API（4 个最稳定）
  netease: [
    'https://netease-cloud-music-api-ruby.vercel.app',
    'https://music-api.leanapp.cn',
    'https://netease-api.vercel.app',
    'https://api.netease.com'
  ],

  // QQ 音乐 API（4 个最稳定）
  qq: [
    'https://u.y.qq.com',
    'https://qq-music-api.vercel.app',
    'https://qqmusic-api.vercel.app',
    'https://api.music.qq.com'
  ],

  // 酷狗音乐 API（4 个最稳定）
  kugou: [
    'https://kugoumusicapi.4everland.app',
    'https://kugou-music-api.vercel.app',
    'https://api.kugou.com',
    'https://music.kugou.com/api'
  ],

  // 酷我音乐 API（4 个最稳定）
  kuwo: [
    'https://www.kuwo.cn/api',
    'https://kuwo-music-api.vercel.app',
    'https://api.kuwo.cn',
    'https://music.kuwo.cn/api'
  ]
};

// ===== 搜索函数 =====
export const musicAPI = {
  // 网易云搜索（自动切换备选 API）
  async searchNetease(keyword: string, limit = 30) {
    for (let i = 0; i < MUSIC_APIS.netease.length; i++) {
      try {
        const api = MUSIC_APIS.netease[i];
        const response = await fetch(
          `${api}/search?keywords=${encodeURIComponent(keyword)}&type=1&limit=${limit}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            data,
            apiIndex: i,
            songs: data.result?.songs || []
          };
        }
      } catch (error) {
        console.warn(`网易云 API #${i + 1} 失败，尝试下一个...`);
        continue;
      }
    }
    throw new Error('所有网易云 API 都失败了');
  },

  // QQ 音乐搜索（自动切换备选 API）
  async searchQQ(keyword: string, limit = 30) {
    for (let i = 0; i < MUSIC_APIS.qq.length; i++) {
      try {
        const api = MUSIC_APIS.qq[i];
        const response = await fetch(
          `${api}/search?keyword=${encodeURIComponent(keyword)}&pagesize=${limit}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            data,
            apiIndex: i,
            songs: data.data || []
          };
        }
      } catch (error) {
        console.warn(`QQ 音乐 API #${i + 1} 失败，尝试下一个...`);
        continue;
      }
    }
    throw new Error('所有 QQ 音乐 API 都失败了');
  },

  // 酷狗搜索（自动切换备选 API）
  async searchKugou(keyword: string, limit = 30) {
    for (let i = 0; i < MUSIC_APIS.kugou.length; i++) {
      try {
        const api = MUSIC_APIS.kugou[i];
        const response = await fetch(
          `${api}/search?keyword=${encodeURIComponent(keyword)}&pagesize=${limit}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            data,
            apiIndex: i,
            songs: data.data || []
          };
        }
      } catch (error) {
        console.warn(`酷狗 API #${i + 1} 失败，尝试下一个...`);
        continue;
      }
    }
    throw new Error('所有酷狗 API 都失败了');
  },

  // 酷我搜索（自动切换备选 API）
  async searchKuwo(keyword: string, limit = 30) {
    for (let i = 0; i < MUSIC_APIS.kuwo.length; i++) {
      try {
        const api = MUSIC_APIS.kuwo[i];
        const response = await fetch(
          `${api}/search?keyword=${encodeURIComponent(keyword)}&pagesize=${limit}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            data,
            apiIndex: i,
            songs: data.data || []
          };
        }
      } catch (error) {
        console.warn(`酷我 API #${i + 1} 失败，尝试下一个...`);
        continue;
      }
    }
    throw new Error('所有酷我 API 都失败了');
  },

  // 获取网易云歌曲播放 URL
  async getNeteaseUrl(songId: string | number) {
    for (const api of MUSIC_APIS.netease) {
      try {
        const response = await fetch(
          `${api}/song/url?id=${songId}&br=320000`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          return data.data?.[0]?.url;
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  },

  // 获取网易云歌词
  async getNeteaseLyric(songId: string | number) {
    for (const api of MUSIC_APIS.netease) {
      try {
        const response = await fetch(
          `${api}/lyric?id=${songId}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          return data.lrc?.lyric;
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  },

  // 获取网易云歌曲详情
  async getNeteaseSongDetail(songId: string | number) {
    for (const api of MUSIC_APIS.netease) {
      try {
        const response = await fetch(
          `${api}/song/detail?ids=${songId}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          return data.songs?.[0];
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  }
};
