<template>
  <div id="app" class="app-container">
    <header class="app-header">
      <h1>🎵 Music Free Web</h1>
      <p>一站式音乐搜索平台</p>
    </header>

    <main class="app-main">
      <MusicSearch />
    </main>

    <footer class="app-footer">
      <p>© 2024 Music Free Web | 支持网易云、QQ 音乐、酷狗、酷我</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import MusicSearch from '@/components/MusicSearch.vue';
</script>

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
  font-weight: bold;
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
  font-size: 12px;
}

.app-footer p {
  margin: 0;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 24px;
  }

  .app-main {
    margin: 10px;
  }
}
</style>
