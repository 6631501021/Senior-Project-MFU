<template>
  <div class="mfu-page">
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
            
            <button class="mfu-expand-btn" @click="openMaximizeModal(mod)" title="Maximize stream">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            </button>

            <button v-if="isAdmin" class="mfu-delete-btn" @click="removeModule(mod.id)" title="Remove module">
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
              style="background: #000; width: 100%; height: 100%; object-fit: cover;"
            />
            <div v-else class="mfu-module-screen-text">CAMERA SIGNAL ACTIVE</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredModules.length === 0" class="mfu-empty-state">
      <p>No modules match your search.</p>
    </div>

    <button v-if="isAdmin" class="mfu-fab" @click="addModule" title="Add camera module">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>

    <div v-if="maximizedModule" class="mfu-modal-overlay" @click.self="closeMaximizeModal">
      <div class="mfu-modal-container">
        <div class="mfu-modal-header">
          <div class="d-flex align-items-center">
            <span class="mfu-modal-title-emoji">{{ maximizedModule.emoji }}</span>
            <span class="mfu-modal-title-text">{{ maximizedModule.nameTh }}</span>
          </div>
          <button class="mfu-modal-close-btn" @click="closeMaximizeModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="mfu-modal-body">
          <img 
            :src="maximizedModule.streamSrc" 
            :alt="maximizedModule.name" 
            class="mfu-modal-stream-img" 
          />
        </div>
      </div>
    </div>

    <!-- Add Camera Modal -->
    <div v-if="showAddCameraModal" class="mfu-modal-overlay" @click.self="closeAddCameraModal">
      <div class="mfu-modal-container mfu-add-camera-container">
        <div class="mfu-modal-header">
          <div class="d-flex align-items-center">
            <span class="mfu-modal-title-emoji">🎥</span>
            <span class="mfu-modal-title-text">เพิ่มกล้องวงจรปิดในระบบ</span>
          </div>
          <button class="mfu-modal-close-btn" @click="closeAddCameraModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="mfu-modal-body p-4 bg-slate-900 text-white">
          <form @submit.prevent="submitAddCamera" class="w-100 mfu-form">
            <div class="form-group mb-3">
              <label class="form-label text-light small mb-1">ชื่อกล้อง / สถานที่ติดตั้ง (Location)*</label>
              <input 
                type="text" 
                v-model="newCamera.location" 
                placeholder="เช่น ทางเข้าป้อมยาม MS (หันออก)" 
                class="form-control mfu-input" 
                required 
              />
            </div>
            <div class="form-group mb-3">
              <label class="form-label text-light small mb-1">IP Address ของกล้อง (IP Address)</label>
              <input 
                type="text" 
                v-model="newCamera.ipAddress" 
                placeholder="เช่น 172.30.36.21" 
                class="form-control mfu-input"
              />
            </div>
            <div class="form-group mb-4">
              <label class="form-label text-light small mb-1">พาธของสตรีมวิดีโอ (Stream Path / URL)*</label>
              <input 
                type="text" 
                v-model="newCamera.streamPath" 
                placeholder="เช่น /Streaming/Channels/102/ หรือ /video_gate_ms_out" 
                class="form-control mfu-input" 
                required 
              />
            </div>
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary mfu-cancel-btn" @click="closeAddCameraModal">ยกเลิก</button>
              <button type="submit" class="btn btn-primary mfu-submit-btn">บันทึกกล้อง</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/service/api'
import securityAccess from '@/projects/mixins/securityAccess'

export default {
  name: 'RealTimeDetection',
  mixins: [securityAccess],
  data() {
    var baseUrl = this.getApiBaseUrl()
    return {
      searchQuery: '',
      backendBaseUrl: baseUrl,
      maximizedModule: null,
      modules: [],
      streamReconnectIntervals: {},
      showAddCameraModal: false,
      newCamera: {
        location: '',
        ipAddress: '',
        streamPath: ''
      }
    }
  },
  computed: {
    isAdmin() {
      const profile = this.$store.getters['auth/profile']
      const role = profile?.role || (profile?.userinfo && profile.userinfo.role) || ''
      return role === 'admin' || this.canViewPath('/newsystem/registry')
    },
    filteredModules() {
      if (!this.searchQuery.trim()) return this.modules
      const q = this.searchQuery.toLowerCase()
      return this.modules.filter(m =>
        m.cameraId.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q)
      )
    }
  },
  mounted() {
    console.log('[RealTimeDetection] Component mounted. Backend Base URL:', this.backendBaseUrl)
    this.fetchCameras()
  },
  methods: {
    async fetchCameras() {
      try {
        const res = await api.mfuVision('cameras')
        if (res && res.data && res.data.data) {
          const cams = res.data.data
          this.modules = cams.map((c) => {
            let finalStreamUrl = '';
            
            // Stream dynamically via GET /api/v1/mfu/cameras/:id/stream
            finalStreamUrl = this.buildStreamUrl(this.backendBaseUrl, `/api/v1/mfu/cameras/${c.cameraId}/stream`);
            
            let emoji = '📷';
            const locLower = String(c.location).toLowerCase();
            if (locLower.includes('entrance') || locLower.includes('ทางเข้า') || locLower.includes('gate')) {
              emoji = locLower.includes('out') || locLower.includes('ออก') ? '🚗' : '🚪';
            }
            return {
              id: c.cameraId,
              emoji: emoji,
              name: c.location,
              nameTh: c.location,
              cameraId: `CAM_ID_0${c.cameraId}`,
              fps: '15.0',
              latency: '200',
              streamSrc: finalStreamUrl,
              isLoading: true,
              streamRefreshTrigger: 0
            }
          });
        }
      } catch (err) {
        console.error('Failed to load cameras, using local fallback:', err)
        this.modules = [
          {
            id: 1,
            emoji: '🚗',
            name: 'Guardhouse Entrance – Out',
            nameTh: 'ทางเข้าป้อมยาม MS (หันออก)',
            cameraId: 'CAM_MS_GATE_OUT',
            fps: '15.0',
            latency: '200',
            streamSrc: this.buildStreamUrl(this.backendBaseUrl, '/video_gate_ms_out'),
            isLoading: true,
            streamRefreshTrigger: 0
          },
          {
            id: 2,
            emoji: '🚪',
            name: 'Guardhouse Entrance – In',
            nameTh: 'ทางเข้าป้อมยาม MS (หันเข้า)',
            cameraId: 'CAM_MS_GATE_IN',
            fps: '15.0',
            latency: '200',
            streamSrc: this.buildStreamUrl(this.backendBaseUrl, '/video_gate_ms_in'),
            isLoading: true,
            streamRefreshTrigger: 0
          }
        ]
      }
    },
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
      console.log(`[RealTimeDetection] Stream loaded successfully: ${module.cameraId} @ ${module.streamSrc}`)
      module.isLoading = false
      if (this.streamReconnectIntervals[module.id]) {
        clearInterval(this.streamReconnectIntervals[module.id])
        delete this.streamReconnectIntervals[module.id]
      }
    },
    onStreamError(module) {
      console.warn(`[RealTimeDetection] Stream failed to load: ${module.cameraId} @ ${module.streamSrc}`)
      module.isLoading = true
      if (!this.streamReconnectIntervals[module.id]) {
        this.streamReconnectIntervals[module.id] = setInterval(() => {
          console.log(`[RealTimeDetection] Retrying stream ${module.cameraId} (attempt #${module.streamRefreshTrigger + 1})`)
          module.streamRefreshTrigger++
        }, 3000)
      }
    },
    async removeModule(id) {
      const targetModule = this.modules.find(m => m.id === id);
      const camName = targetModule ? targetModule.nameTh : 'กล้องนี้';

      const isConfirmed = confirm(`คุณต้องการลบกล้อง "${camName}" ออกจากระบบ PostgreSQL ใช่หรือไม่?`);
      if (!isConfirmed) return;

      try {
        await api.mfuVision('delete-camera', { id })
        if (this.streamReconnectIntervals[id]) {
          clearInterval(this.streamReconnectIntervals[id])
          delete this.streamReconnectIntervals[id]
        }
        if (this.maximizedModule && this.maximizedModule.id === id) {
          this.closeMaximizeModal();
        }
        await this.fetchCameras()
      } catch (err) {
        alert('Failed to delete camera: ' + (err.response?.data?.message || err.message))
      }
    },
    addModule() {
      this.showAddCameraModal = true
      this.newCamera = {
        location: '',
        ipAddress: '',
        streamPath: ''
      }
      document.body.style.overflow = 'hidden'
    },
    closeAddCameraModal() {
      this.showAddCameraModal = false
      document.body.style.overflow = ''
    },
    async submitAddCamera() {
      if (!this.newCamera.location.trim() || !this.newCamera.streamPath.trim()) {
        alert('ข้อผิดพลาด: จำเป็นต้องระบุชื่อของกล้องและพาธสตรีม')
        return
      }
      try {
        await api.mfuVision('create-camera', {
          location: this.newCamera.location.trim(),
          ip_address: this.newCamera.ipAddress.trim() || null,
          stream_path: this.newCamera.streamPath.trim()
        })
        this.closeAddCameraModal()
        await this.fetchCameras()
      } catch (err) {
        alert('Failed to add camera: ' + (err.response?.data?.message || err.message))
      }
    },
    openMaximizeModal(module) {
      this.maximizedModule = module;
      document.body.style.overflow = 'hidden';
    },
    closeMaximizeModal() {
      this.maximizedModule = null;
      document.body.style.overflow = '';
    }
  },
  beforeDestroy() {
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

.mfu-streams-column {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  width: 100%;
}

@media (min-width: 1200px) {
  .mfu-streams-column {
    grid-template-columns: repeat(3, 1fr);
  }
}

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

.mfu-expand-btn {
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

.mfu-expand-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
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

.mfu-module-screen {
  background: linear-gradient(180deg, #1e293b 0%, #111827 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative !important;
  height: 250px;
  width: 100%;
}

.mfu-stream-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #0d1117;
}

.mfu-module-screen-text {
  color: #475569;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  font-weight: 600;
}

.mfu-empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;
  font-size: 1rem;
}

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

/* Modal CSS */
.mfu-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.mfu-modal-container {
  background: #1e293b;
  border-radius: 1rem;
  width: 100%;
  max-width: 1000px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.mfu-modal-header {
  padding: 1rem 1.5rem;
  background: #0f172a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #f8fafc;
}

.mfu-modal-title-emoji {
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

.mfu-modal-title-text {
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: -0.01em;
}

.mfu-modal-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.mfu-modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.mfu-modal-body {
  background: #090d16;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-height: 75vh;
}

.mfu-modal-stream-img {
  width: 100%;
  height: auto;
  max-height: 75vh;
  object-fit: contain;
}

.mfu-add-camera-container {
  max-width: 500px;
}

.mfu-form {
  padding: 1rem 1.5rem;
  width: 100%;
}

.mfu-input {
  background: #0f172a;
  border: 1px solid #334155;
  color: #f8fafc;
  border-radius: 0.5rem;
  padding: 0.6rem 0.8rem;
  transition: all 0.2s ease;
  width: 100%;
}

.mfu-input:focus {
  border-color: #991b1b;
  box-shadow: 0 0 0 3px rgba(153, 27, 27, 0.25);
  background: #0f172a;
  color: #ffffff;
}

.mfu-cancel-btn {
  background: #334155;
  border: none;
  color: #f8fafc;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.mfu-cancel-btn:hover {
  background: #475569;
}

.mfu-submit-btn {
  background: #7f1d1d;
  border: none;
  color: #ffffff;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.mfu-submit-btn:hover {
  background: #991b1b;
}
</style>