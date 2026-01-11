<script setup lang="ts">
import { ref } from 'vue';
import Search from '@/components/Search.vue';

const currentSong = ref(null);

// 监听播放事件
window.addEventListener('play-song', (event: any) => {
  currentSong.value = event.detail;
  console.log('当前播放:', currentSong.value);
});
</script>

<template>
  <div id="app" class="app-container">
    <header class="app-header">
      <h1>🎵 Music Free Web</h1>
      <p>一站式音乐搜索平台</p>
    </header>

    <main class="app-main">
      <Search />
    </main>

    <footer class="app-footer" v-if="currentSong">
      <p>当前播放: {{ currentSong.name }} - {{ currentSong.artist }}</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  color: white;
  padding: 40px 20px;
}

.app-header h1 {
  margin: 0;
  font-size: 32px;
}

.app-header p {
  margin: 10px 0 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.app-main {
  flex: 1;
  background: white;
  margin: 20px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.app-footer {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px 20px;
  text-align: center;
  font-size: 14px;
}

.app-footer p {
  margin: 0;
}
</style>
