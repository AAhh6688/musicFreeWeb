<script setup lang="ts">
import { ref } from 'vue';
import { searchService, type Song } from '@/services/searchService';

const searchKeyword = ref('');
const searchResults = ref<Song[]>([]);
const loading = ref(false);
const selectedPlatform = ref<'all' | 'netease' | 'qq' | 'kugou' | 'kuwo'>('all');

// 执行搜索
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = [];
    return;
  }

  loading.value = true;
  try {
    if (selectedPlatform.value === 'all') {
      searchResults.value = await searchService.searchAll(searchKeyword.value);
    } else {
      searchResults.value = await searchService.searchPlatform(
        searchKeyword.value,
        selectedPlatform.value
      );
    }
  } catch (error) {
    console.error('搜索出错:', error);
    searchResults.value = [];
  } finally {
    loading.value = false;
  }
};

// 回车搜索
const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
};

// 播放歌曲
const playSong = (song: Song) => {
  console.log('播放歌曲:', song);
  // 这里可以触发播放事件
  const event = new CustomEvent('play-song', { detail: song });
  window.dispatchEvent(event);
};
</script>

<template>
  <div class="search-container">
    <!-- 平台选择 -->
    <div class="platform-tabs">
      <button
        v-for="platform in ['all', 'netease', 'qq', 'kugou', 'kuwo']"
        :key="platform"
        @click="selectedPlatform = platform as any"
        :class="{ active: selectedPlatform === platform }"
        class="platform-btn"
      >
        {{
          {
            all: '全部',
            netease: '网易云',
            qq: 'QQ 音乐',
            kugou: '酷狗',
            kuwo: '酷我'
          }[platform]
        }}
      </button>
    </div>

    <!-- 搜索框 -->
    <div class="search-box">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索歌曲、艺术家..."
        @keyup="handleKeyUp"
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

      <div v-else-if="searchResults.length === 0 && searchKeyword" class="no-results">
        <p>未找到相关歌曲</p>
      </div>

      <div v-else class="results-list">
        <div
          v-for="song in searchResults"
          :key="`${song.platform}-${song.id}`"
          class="song-item"
          @click="playSong(song)"
        >
          <div class="song-cover" v-if="song.cover">
            <img :src="song.cover" :alt="song.name" />
          </div>

          <div class="song-info">
            <h3 class="song-name">{{ song.name }}</h3>
            <p class="song-artist">{{ song.artist }}</p>
            <p class="song-album" v-if="song.album">{{ song.album }}</p>
          </div>

          <div class="song-platform">
            <span class="platform-badge">{{ song.platform }}</span>
          </div>

          <button class="play-btn" @click.stop="playSong(song)">▶</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.platform-tabs {
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

.song-name {
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

.song-platform {
  flex-shrink: 0;
}

.platform-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #1db954;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
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
  flex-shrink: 0;
}

.play-btn:hover {
  background: #1ed760;
  transform: scale(1.1);
}
</style>
