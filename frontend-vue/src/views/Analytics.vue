<template>
  <div class="mfu-dashboard">
    <!-- Page Header -->
    <div class="mfu-dash-header">
      <h1 class="mfu-dash-heading">System Overview</h1>
      <p class="mfu-dash-sub">MFU Main Gate</p>
    </div>

    <!-- Stat Cards -->
    <CRow class="mb-4">
      <CCol lg="4" class="mb-3">
        <div class="mfu-stat-card">
          <div class="mfu-stat-card-top">
            <div class="mfu-stat-icon mfu-stat-icon--red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span class="mfu-stat-change mfu-stat-change--up">+12%</span>
          </div>
          <div class="mfu-stat-label">VIOLATION TODAY</div>
          <div class="mfu-stat-value">{{ violationToday.toLocaleString() }}</div>
        </div>
      </CCol>
      <CCol lg="4" class="mb-3">
        <div class="mfu-stat-card">
          <div class="mfu-stat-card-top">
            <div class="mfu-stat-icon mfu-stat-icon--amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <span class="mfu-stat-change mfu-stat-change--up">+4.2%</span>
          </div>
          <div class="mfu-stat-label">VIOLATION LAST HOUR</div>
          <div class="mfu-stat-value">{{ violationLastHour }}</div>
        </div>
      </CCol>
      <CCol lg="4" class="mb-3">
        <div class="mfu-stat-card">
          <div class="mfu-stat-card-top">
            <div class="mfu-stat-icon mfu-stat-icon--slate">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
          </div>
          <div class="mfu-stat-label">ACTIVE CAMERAS</div>
          <div class="mfu-stat-value">{{ activeCameras }}</div>
        </div>
      </CCol>
    </CRow>

    <!-- Chart & Recent Violations -->
    <CRow>
      <CCol lg="8" class="mb-4">
        <div class="mfu-chart-panel">
          <div class="mfu-chart-panel-header">
            <h3 class="mfu-chart-panel-title">Detection Trends</h3>
            <div class="mfu-chart-toggle">
              <button
                :class="['mfu-toggle-btn', { active: chartRange === '24h' }]"
                @click="chartRange = '24h'"
              >24 HOURS</button>
              <button
                :class="['mfu-toggle-btn', { active: chartRange === '7d' }]"
                @click="chartRange = '7d'"
              >7 DAYS</button>
            </div>
          </div>
          <div class="mfu-chart-body">
            <CChartBar
              :datasets="trendData.datasets"
              :labels="trendData.labels"
              :options="chartOptions"
              style="height: 280px;"
            />
          </div>
        </div>
      </CCol>
      <CCol lg="4" class="mb-4">
        <div class="mfu-violations-panel">
          <div class="mfu-violations-header">
            <h3 class="mfu-violations-title">RECENT VIOLATIONS</h3>
            <span class="mfu-live-badge">LIVE</span>
          </div>
          <div class="mfu-violations-list">
            <div
              v-for="(item, idx) in recentViolations"
              :key="idx"
              class="mfu-violation-item"
            >
              <div class="mfu-violation-thumb">
                <img :src="item.image" :alt="'Violation ' + (idx + 1)" />
              </div>
              <div class="mfu-violation-info">
                <div class="mfu-violation-type">{{ item.type }}</div>
                <div class="mfu-violation-location">{{ item.location }}</div>
                <div class="mfu-violation-plate">PLATE: {{ item.plate }}</div>
              </div>
              <div class="mfu-violation-time">{{ item.time }}</div>
            </div>
          </div>
          <router-link to="/mfu/records" class="mfu-violations-viewall">
            VIEW ALL INCIDENTS
          </router-link>
        </div>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import { CChartBar } from '@coreui/vue-chartjs'
import api from '@/service/api'

export default {
  name: 'Analytics',
  components: {
    CChartBar
  },
  data() {
    return {
      violationToday: 0,
      violationLastHour: 0,
      activeCameras: 0,
      chartRange: '24h',
      recentViolations: [],
      hourlyTrendData: [],
      dailyTrendData: [],
      apiConnected: false,
      chartOptions: {
        maintainAspectRatio: false,
        responsive: true,
        legend: { display: false },
        tooltips: {
          backgroundColor: '#0f172a',
          titleFontColor: '#f8fafc',
          bodyFontColor: '#f8fafc',
          cornerRadius: 8
        },
        scales: {
          xAxes: [{
            gridLines: { display: false },
            ticks: { fontColor: '#94a3b8', fontSize: 12 }
          }],
          yAxes: [{
            gridLines: { color: '#f1f5f9', zeroLineColor: '#f1f5f9' },
            ticks: { beginAtZero: true, fontColor: '#94a3b8', fontSize: 12 }
          }]
        }
      }
    }
  },
  computed: {
    trendData() {
      if (this.chartRange === '24h') {
        if (this.apiConnected && this.hourlyTrendData.length > 0) {
          var labels = []
          var data = []
          for (var h = 0; h < 24; h += 2) {
            labels.push(String(h).padStart(2, '0') + ':00')
            var found = this.hourlyTrendData.find(function (item) { return item._id === h || item._id === h + 1 })
            data.push(found ? found.count : 0)
          }
          return {
            labels: labels,
            datasets: [{
              label: 'Violations',
              backgroundColor: data.map(function (v) {
                return v > 50 ? '#991b1b' : v > 20 ? '#f87171' : '#fecdd3'
              }),
              borderRadius: 6,
              barPercentage: 0.6,
              data: data
            }]
          }
        }
        return {
          labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
          datasets: [{
            label: 'Violations',
            backgroundColor: [
              '#fecdd3', '#fecdd3', '#f87171', '#991b1b',
              '#991b1b', '#f87171', '#fecdd3', '#fecdd3', '#fecdd3'
            ],
            borderRadius: 6,
            barPercentage: 0.6,
            data: [18, 25, 42, 85, 72, 55, 38, 28, 22]
          }]
        }
      }
      // 7 days
      if (this.apiConnected && this.dailyTrendData.length > 0) {
        var dayNames = ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        var labels7 = []
        var data7 = []
        for (var d = 1; d <= 7; d++) {
          labels7.push(dayNames[d])
          var foundD = this.dailyTrendData.find(function (item) { return item._id === d })
          data7.push(foundD ? foundD.count : 0)
        }
        return {
          labels: labels7,
          datasets: [{
            label: 'Violations',
            backgroundColor: data7.map(function (v) {
              return v > 30 ? '#991b1b' : v > 15 ? '#f87171' : '#fecdd3'
            }),
            borderRadius: 6,
            barPercentage: 0.6,
            data: data7
          }]
        }
      }
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Violations',
          backgroundColor: [
            '#fecdd3', '#f87171', '#991b1b', '#f87171',
            '#fecdd3', '#fecdd3', '#fecdd3'
          ],
          borderRadius: 6,
          barPercentage: 0.6,
          data: [120, 185, 240, 160, 95, 72, 55]
        }]
      }
    }
  },
  mounted() {
    this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      try {
        // Fetch stats
        var statsRes = await api.mfuVision('stats')
        if (statsRes && statsRes.data && statsRes.data.data) {
          var s = statsRes.data.data
          this.violationToday = s.violations_today || 0
          this.violationLastHour = s.violations_last_hour || 0
          this.activeCameras = s.active_cameras || 0
          this.hourlyTrendData = s.hourly_trend || []
          this.dailyTrendData = s.daily_trend || []
          this.apiConnected = true
        }

        // Fetch recent violations
        var recRes = await api.mfuVision('records', { limit: 5, sort: '-timestamp' })
        if (recRes && recRes.data && recRes.data.data && recRes.data.data.records) {
          var self = this
          this.recentViolations = recRes.data.data.records.map(function (r) {
            return {
              type: self.formatViolationType(r.violation_type),
              location: r.location || 'Unknown',
              plate: r.plate_number || 'N/A',
              time: self.timeAgo(r.timestamp),
              image: r.image_url || 'https://placehold.co/80x60/1f2937/94a3b8?text=CAM'
            }
          })
        }
      } catch (err) {
        // API not available — keep mock data as fallback
        this.applyMockData()
      }
    },
    applyMockData() {
      this.violationToday = 1000
      this.violationLastHour = 500
      this.activeCameras = 1
      this.recentViolations = [
        { type: 'No Helmet Detected', location: 'Post guard gate - IN', plate: '1กก-8822', time: '2m ago', image: 'https://placehold.co/80x60/1f2937/94a3b8?text=CAM' },
        { type: 'No Helmet Detected', location: 'Post guard gate - OUT', plate: '3กb-1234', time: '8m ago', image: 'https://placehold.co/80x60/1f2937/94a3b8?text=CAM' },
        { type: 'No Helmet Detected', location: 'Dormitory Gate - IN', plate: 'ษร-999', time: '15m ago', image: 'https://placehold.co/80x60/1f2937/94a3b8?text=CAM' }
      ]
    },
    formatViolationType(type) {
      var map = { no_helmet: 'No Helmet Detected', unauthorized_entry: 'Unauthorized Entry', speeding: 'Speeding', other: 'Other Violation' }
      return map[type] || type || 'Unknown'
    },
    timeAgo(timestamp) {
      if (!timestamp) return ''
      var diff = Date.now() - new Date(timestamp).getTime()
      var minutes = Math.floor(diff / 60000)
      if (minutes < 1) return 'just now'
      if (minutes < 60) return minutes + 'm ago'
      var hours = Math.floor(minutes / 60)
      if (hours < 24) return hours + 'h ago'
      var days = Math.floor(hours / 24)
      return days + 'd ago'
    }
  }
}
</script>

<style scoped>
.mfu-dashboard {
  padding: 0.5rem;
}

/* Header */
.mfu-dash-header {
  margin-bottom: 2rem;
}
.mfu-dash-heading {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}
.mfu-dash-sub {
  color: #64748b;
  font-size: 0.95rem;
}

/* Stat Cards */
.mfu-stat-card {
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  height: 100%;
  transition: box-shadow 0.2s ease;
}
.mfu-stat-card:hover {
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1), 0 12px 32px rgba(15, 23, 42, 0.06);
}
.mfu-stat-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.mfu-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mfu-stat-icon--red { background: #fef2f2; }
.mfu-stat-icon--amber { background: #fffbeb; }
.mfu-stat-icon--slate { background: #f8fafc; }
.mfu-stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}
.mfu-stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}
.mfu-stat-change {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
}
.mfu-stat-change--up {
  color: #dc2626;
  background: #fef2f2;
}

/* Chart Panel */
.mfu-chart-panel {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  height: 100%;
}
.mfu-chart-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}
.mfu-chart-panel-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.mfu-chart-toggle {
  display: flex;
  gap: 0;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
}
.mfu-toggle-btn {
  padding: 0.4rem 0.75rem;
  border: none;
  background: #ffffff;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mfu-toggle-btn.active {
  background: #f8fafc;
  color: #0f172a;
}
.mfu-toggle-btn:hover:not(.active) {
  background: #f8fafc;
}
.mfu-chart-body {
  padding: 1.5rem;
}

/* Recent Violations Panel */
.mfu-violations-panel {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.mfu-violations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}
.mfu-violations-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.05em;
  margin: 0;
}
.mfu-live-badge {
  display: inline-flex;
  align-items: center;
  background: #dc2626;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  letter-spacing: 0.05em;
}
.mfu-violations-list {
  flex: 1;
  padding: 0.75rem 1.25rem;
}
.mfu-violation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8fafc;
}
.mfu-violation-item:last-child {
  border-bottom: none;
}
.mfu-violation-thumb {
  flex-shrink: 0;
  width: 64px;
  height: 48px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f1f5f9;
}
.mfu-violation-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mfu-violation-info {
  flex: 1;
  min-width: 0;
}
.mfu-violation-type {
  font-size: 0.85rem;
  font-weight: 700;
  color: #dc2626;
}
.mfu-violation-location {
  font-size: 0.8rem;
  color: #475569;
}
.mfu-violation-plate {
  font-size: 0.7rem;
  color: #94a3b8;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05em;
}
.mfu-violation-time {
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap;
}
.mfu-violations-viewall {
  display: block;
  text-align: center;
  padding: 1rem;
  border-top: 1px solid #f1f5f9;
  color: #0f172a;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  transition: background 0.2s ease;
}
.mfu-violations-viewall:hover {
  background: #f8fafc;
  text-decoration: none;
  color: #991b1b;
}
</style>
