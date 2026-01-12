<template>
  <div class="music-search-container">
    <!-- 平台选择 -->
    <div class="platform-selector">
      <button
        v-for="platform in platforms"
        :key="platform"
        @click="selectPlatform(platform)"
        :class="{ active: currentPlatform === platform }"
        class="platform-btn"
      >
        {{ getPlatformName(platform) }}
      </button>
    </div>

    <!-- 搜索框 -->
    <div class="search-box">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索歌曲、艺术家..."
        @keyup.enter="handleSearch"
        class="search-input"
      />
      <button @click="handleSearch" :disabled="loading" class="search-btn">
        {{ loading ? '搜索中...' : '搜索' }}
      </button>
    </div>

    <!-- 搜索结果 -->
    <div class="results-container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>搜索中...</p>
      </div>

      <div v-else-if="searchResults.length === 0 && hasSearched" class="no-results">
        <p>未找到相关歌曲</p>
      </div>

      <div v-else class="results-list">
        <div
          v-for="(song, index) in searchResults"
          :key="`${song.platform}-${song.id}-${index}`"
          class="song-item"
          @click="selectSong(song)"
        >
          <div class="song-cover" v-if="song.cover">
            <img :src="song.cover" :alt="song.title" @error="handleImageError" />
          </div>

          <div class="song-info">
            <h3 class="song-title">{{ song.title }}</h3>
            <p class="song-artist">{{ song.artist }}</p>
            <p class="song-album" v-if="song.album">{{ song.album }}</p>
          </div>

          <div class="song-actions">
            <button @click.stop="playSong(song)" class="play-btn" title="播放">
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 播放器 -->
    <div v-if="currentSong" class="player">
      <div class="player-info">
        <p class="player-title">{{ currentSong.title }}</p>
        <p class="player-artist">{{ currentSong.artist }}</p>
      </div>
      <audio
        ref="audioPlayer"
        :src="playUrl"
        @ended="handleSongEnd"
        controls
        class="audio-player"
      ></audio>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { musicSearchService, type SongItem } from '@/services/musicSearch';

const searchKeyword = ref('');
const searchResults = ref<SongItem[]>([]);
const loading = ref(false);
const hasSearched = ref(false);
const currentPlatform = ref('netease');
const platforms = ref<string[]>([]);
const currentSong = ref<SongItem | null>(null);
const playUrl = ref('');
const audioPlayer = ref<HTMLAudioElement | null>(null);

// 平台名称映射
const platformNames: Record<string, string> = {
  netease: '网易云',
  qq: 'QQ 音乐',
  kugou: '酷狗',
  kuwo: '酷我'
};

// 获取平台名称
const getPlatformName = (platform: string): string => {
  return platformNames[platform] || platform;
};

// 初始化
onMounted(async () => {
  try {
    await musicSearchService.initialize();
    platforms.value = musicSearchService.getAllPlatforms();
    currentPlatform.value = musicSearchService.getPlatform();
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
});

// 选择平台
const selectPlatform = (platform: string): void => {
  currentPlatform.value = platform;
  musicSearchService.setPlatform(platform);
};

// 处理搜索
const handleSearch = async (): Promise<void> => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = [];
    hasSearched.value = false;
    return;
  }

  loading.value = true;
  hasSearched.value = true;

  try {
    searchResults.value = await musicSearchService.search(searchKeyword.value);
  } catch (error) {
    console.error('Search failed:', error);
    searchResults.value = [];
  } finally {
    loading.value = false;
  }
};

// 选择歌曲
const selectSong = (song: SongItem): void => {
  currentSong.value = song;
};

// 播放歌曲
const playSong = async (song: SongItem): Promise<void> => {
  try {
    currentSong.value = song;
    playUrl.value = await musicSearchService.getPlayUrl(song);

    // 等待音频元素更新后再播放
    setTimeout(() => {
      if (audioPlayer.value) {
        audioPlayer.value.play();
      }
    }, 100);
  } catch (error) {
    console.error('Failed to play song:', error);
  }
};

// 歌曲播放结束
const handleSongEnd = (): void => {
  currentSong.value = null;
  playUrl.value = '';
};

// 处理图片加载错误
const handleImageError = (event: Event): void => {
  const img = event.target as HTMLImageElement;
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3E无图片%3C/text%3E%3C/svg%3E';
};
</script>

<style scoped>
.music-search-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.platform-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.platform-btn {
  padding: 8px 16px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
}

.platform-btn.active {
  border-color: #1db954;
  background: #1db954;
  color: white;
}

.platform-btn:hover:not(.active) {
  border-color: #999;
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #1db954;
  box-shadow: 0 0 0 3px rgba(29, 185, 84, 0.1);
}

.search-btn {
  padding: 12px 24px;
  background: #1db954;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.search-btn:hover:not(:disabled) {
  background: #1ed760;
}

.search-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.results-container {
  min-height: 100px;
  margin-bottom: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1db954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #999;
}

.results-list {
  display: grid;
  gap: 12px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
}

.song-item:hover {
  background: #f0f0f0;
  border-color: #1db954;
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-album {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-actions {
  flex-shrink: 0;
}

.play-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1db954;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.play-btn:hover {
  background: #1ed760;
  transform: scale(1.1);
}

.player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1db954;
  color: white;
  padding: 15px 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.player-info {
  margin-bottom: 10px;
}

.player-title {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
}

.player-artist {
  margin: 4px 0 0 0;
  font-size: 12px;
  opacity: 0.9;
}

.audio-player {
  width: 100%;
  height: 30px;
}
</style>
