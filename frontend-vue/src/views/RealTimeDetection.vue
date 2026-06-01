<template>
  <div class="mfu-page">
    <!-- Page Header -->
    <div class="mfu-page-header d-flex flex-wrap justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mfu-page-title">AI Modular Demo</h1>
      </div>
      <div class="mfu-page-search">
        <div class="mfu-search-input">
          <svg class="mfu-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search Camera ID..." v-model="searchQuery" class="mfu-search-field" />
        </div>
      </div>
    </div>

    <!-- 3-Column CCTV Grid (Fits completely on desktop screen without scrolling) -->
    <div class="mfu-streams-column">
      <div v-for="(mod, index) in filteredModules" :key="mod.id" class="mfu-module-card">
        <div class="mfu-module-card-header">
          <div class="d-flex align-items-center text-truncate">
            <span class="mfu-module-emoji">{{ mod.emoji }}</span>
            <span class="mfu-module-label">Module {{ index + 1 }}:</span>
            <span class="text-truncate">{{ mod.nameTh }}</span>
          </div>
        </div>
        <div class="mfu-module-preview">
          <div class="mfu-module-preview-meta">
            <span class="mfu-live-dot" :class="{ 'live-dot--connecting': mod.isLoading }"></span>
            <span class="mfu-live-text">{{ mod.isLoading ? 'CONNECTING' : 'LIVE' }}</span>
            <span class="mfu-cam-id text-truncate">// {{ mod.cameraId }}</span>
          </div>
          <div class="mfu-module-preview-stats">
            <span class="mfu-stat-badge">FPS {{ mod.fps }}</span>
            <span class="mfu-stat-badge">LATENCY {{ mod.latency }}ms</span>
            <button class="mfu-delete-btn" @click="removeModule(mod.id)" title="Remove module">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
          <div class="mfu-module-screen">
            <img 
              v-if="mod.streamSrc" 
              :src="mod.streamSrc" 
              :alt="mod.name" 
              class="mfu-stream-img"
              :key="mod.id + '-' + mod.streamRefreshTrigger"
              @load="onStreamLoad(mod)"
              @error="onStreamError(mod)"
            />
            <div v-else class="mfu-module-screen-text">CAMERA SIGNAL ACTIVE</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredModules.length === 0" class="mfu-empty-state">
      <p>No modules match your search.</p>
    </div>

    <!-- Add Module FAB -->
    <button class="mfu-fab" @click="addModule" title="Add camera module">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'RealTimeDetection',
  data() {
    var baseUrl = this.getApiBaseUrl()
    return {
      searchQuery: '',
      backendBaseUrl: baseUrl,
      modules: [
        {
          id: 1,
          emoji: '🟠',
          name: 'Helmet Detection System',
          nameTh: 'ตรวจจับหมวกกันน็อก',
          cameraId: 'CAM_01_HELMET',
          fps: '25.0',
          latency: '14',
          streamSrc: this.buildStreamUrl(baseUrl, '/video_helmet'),
          isLoading: true,
          streamRefreshTrigger: 0
        },
        {
          id: 2,
          emoji: '🏍',
          name: 'Motorcycle Tracking System',
          nameTh: 'ติดตามรถมอเตอร์ไซค์',
          cameraId: 'CAM_02_MOTO',
          fps: '25.0',
          latency: '16',
          streamSrc: this.buildStreamUrl(baseUrl, '/video_moto'),
          isLoading: true,
          streamRefreshTrigger: 0
        },
        {
          id: 3,
          emoji: '🔢',
          name: 'License Plate Recognition',
          nameTh: 'อ่านป้ายทะเบียน',
          cameraId: 'CAM_03_PLATE',
          fps: '25.0',
          latency: '22',
          streamSrc: this.buildStreamUrl(baseUrl, '/video_plate'),
          isLoading: true,
          streamRefreshTrigger: 0
        }
      ],
      nextId: 4,
      streamReconnectIntervals: {}
    }
  },
  computed: {
    filteredModules() {
      if (!this.searchQuery.trim()) return this.modules
      const q = this.searchQuery.toLowerCase()
      return this.modules.filter(m =>
        m.cameraId.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q)
      )
    }
  },
  methods: {
    getApiBaseUrl() {
      var configuredUrl = process.env.VUE_APP_API_BASE_URL
      if (configuredUrl && configuredUrl !== '/') {
        return configuredUrl.replace(/\/+$/, '')
      }
      if (configuredUrl === '/') return ''
      if (typeof window !== 'undefined' && window.location && window.location.hostname) {
        return 'http://' + window.location.hostname + ':8097'
      }
      return 'http://127.0.0.1:8097'
    },
    buildStreamUrl(baseUrl, path) {
      return (baseUrl || '') + path
    },
    onStreamLoad(module) {
      module.isLoading = false
      // Clear any existing reconnect interval
      if (this.streamReconnectIntervals[module.id]) {
        clearInterval(this.streamReconnectIntervals[module.id])
        delete this.streamReconnectIntervals[module.id]
      }
    },
    onStreamError(module) {
      module.isLoading = true
      // Set up automatic reconnection
      if (!this.streamReconnectIntervals[module.id]) {
        this.streamReconnectIntervals[module.id] = setInterval(() => {
          // Trigger re-render by updating streamRefreshTrigger
          module.streamRefreshTrigger++
        }, 3000)
      }
    },
    removeModule(id) {
      // Clear reconnect interval if exists
      if (this.streamReconnectIntervals[id]) {
        clearInterval(this.streamReconnectIntervals[id])
        delete this.streamReconnectIntervals[id]
      }
      this.modules = this.modules.filter(m => m.id !== id)
    },
    addModule() {
      const newId = this.nextId++
      this.modules.push({
        id: newId,
        emoji: '📷',
        name: 'New Camera Module',
        nameTh: 'โมดูลกล้องใหม่',
        cameraId: `CAM_0${newId}_NEW`,
        fps: '0.0',
        latency: '--',
        streamSrc: '',
        isLoading: false,
        streamRefreshTrigger: 0
      })
    }
  },
  beforeDestroy() {
    // Clean up all reconnect intervals
    Object.values(this.streamReconnectIntervals).forEach(interval => clearInterval(interval))
  }
}
</script>

<style scoped>
.mfu-page {
  padding: 0.5rem;
  position: relative;
  min-height: calc(100vh - 120px);
}

.mfu-page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0;
  letter-spacing: -0.02em;
}

.mfu-page-search {
  min-width: 240px;
}

.mfu-search-input {
  position: relative;
  display: flex;
  align-items: center;
}

.mfu-search-icon {
  position: absolute;
  left: 0.75rem;
  pointer-events: none;
}

.mfu-search-field {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  transition: border-color 0.2s ease;
}

.mfu-search-field:focus {
  border-color: #991b1b;
  box-shadow: 0 0 0 3px rgba(153, 27, 27, 0.08);
}

.mfu-search-field::placeholder {
  color: #94a3b8;
}

/* 3-Column CCTV Grid (Forces side-by-side display so all 3 cameras fit on desktop) */
.mfu-streams-column {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  width: 100%;
}

@media (min-width: 1200px) {
  .mfu-streams-column {
    grid-template-columns: repeat(3, 1fr); /* Exactly 3 columns side-by-side */
  }
}

/* Module Card */
.mfu-module-card {
  width: 100%;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.mfu-module-card:hover {
  transform: translateY(-2px);
}

.mfu-module-card-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-weight: 700;
  font-size: 0.9rem;
  color: #0f172a;
  background: #f8fafc;
}

.mfu-module-emoji {
  margin-right: 0.5rem;
}

.mfu-module-label {
  color: #64748b;
  font-weight: 700;
  margin-right: 0.25rem;
}

/* Preview Area */
.mfu-module-preview {
  position: relative;
  background: #111827;
  padding: 0.75rem;
}

.mfu-module-preview-meta {
  display: flex;
  align-items: center;
  color: #f8fafc;
  font-size: 0.7rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  gap: 0.3rem;
}

.mfu-live-dot {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  display: inline-block;
  animation: livePulse 1.5s ease-in-out infinite;
}

.mfu-live-dot.live-dot--connecting {
  background: #f59e0b;
  animation: livePulseConnecting 1s ease-in-out infinite;
}

@keyframes livePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@keyframes livePulseConnecting {
  0%, 100% { opacity: 0.5; box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
  50% { opacity: 1; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0); }
}

.mfu-live-text {
  color: #f8fafc;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.mfu-cam-id {
  color: #64748b;
  text-transform: uppercase;
  margin-left: 0.25rem;
  font-family: monospace;
}

.mfu-module-preview-stats {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.mfu-stat-badge {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
  letter-spacing: 0.03em;
  font-family: monospace;
}

.mfu-delete-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  border-radius: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mfu-delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Video Screen container (Compact height perfectly suited for portrait/vertical CCTV video frames without tall overflow) */
.mfu-module-screen {
  background: linear-gradient(180deg, #1e293b 0%, #111827 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative !important;
  height: 250px; /* Reduced compact height! fits the screen completely side-by-side */
  width: 100%;
}

.mfu-stream-img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Contain ensures full vertical phone video aspect fits neatly without letterbox stretch */
  background: #0d1117;
}

.mfu-module-screen-text {
  color: #475569;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  font-weight: 600;
}

/* Empty State */
.mfu-empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;
  font-size: 1rem;
}

/* FAB */
.mfu-fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #7f1d1d;
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(127, 29, 29, 0.4);
  transition: all 0.2s ease;
  z-index: 100;
}

.mfu-fab:hover {
  background: #991b1b;
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(127, 29, 29, 0.5);
}
</style>
