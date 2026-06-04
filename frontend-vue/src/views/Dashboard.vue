<template>
<<<<<<< HEAD
  <div class="mfu-dashboard">
    <!-- Admin Dashboard View -->
    <div v-if="isAdmin">
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

    <!-- User Dashboard View -->
    <div v-else>
      <!-- Page Header -->
      <div class="mfu-dash-header">
        <h1 class="mfu-dash-heading font-weight-bold" style="font-size: 2.25rem; color:#0f172a; margin-bottom: 1.5rem;">DASHBOARD</h1>
      </div>

      <!-- Stat Cards -->
      <CRow class="mb-4">
        <CCol md="3" sm="6" class="mb-3">
          <div class="user-stat-card border-card">
            <div class="user-stat-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a31d1d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M3 17.5V14h7v3.5M10.5 11.5L8 14h5zM18.5 17.5h-5V14h5z"/></svg>
            </div>
            <div class="user-stat-label">YOUR VIOLATION TODAY</div>
            <div class="user-stat-value">{{ violationToday.toLocaleString() }}</div>
          </div>
        </CCol>
        <CCol md="3" sm="6" class="mb-3">
          <div class="user-stat-card border-card">
            <div class="user-stat-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a31d1d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div class="user-stat-label">YOUR VIOLATION WEEKS</div>
            <div class="user-stat-value">{{ violationsWeek.toLocaleString() }}</div>
          </div>
        </CCol>
        <CCol md="3" sm="6" class="mb-3">
          <div class="user-stat-card border-card">
            <div class="user-stat-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a31d1d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M7 14h2v2H7z"/></svg>
            </div>
            <div class="user-stat-label">YOUR VIOLATION MONTH</div>
            <div class="user-stat-value">{{ violationsMonth.toLocaleString() }}</div>
          </div>
        </CCol>
        <CCol md="3" sm="6" class="mb-3">
          <div class="user-stat-card solid-card">
            <div class="user-stat-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            </div>
            <div class="user-stat-label text-white">YOUR TOTAL VIOLATION</div>
            <div class="user-stat-value text-white">{{ totalViolation.toLocaleString() }}</div>
          </div>
        </CCol>
      </CRow>

      <!-- Chart & Recent Violations -->
      <CRow>
        <CCol lg="8" class="mb-4">
          <div class="user-chart-panel">
            <div class="user-chart-panel-header">
              <h3 class="user-chart-panel-title font-weight-bold" style="color: #0f172a;">VIOLATION TREND</h3>
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
          <div class="user-violations-panel">
            <div class="user-violations-header">
              <h3 class="user-violations-title font-weight-bold" style="color: #0f172a;">Your violation</h3>
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
                  <div class="mfu-violation-type font-weight-bold" style="color: #a31d1d;">{{ item.type }}</div>
                  <div class="mfu-violation-location" style="color: #475569;">{{ item.location }}</div>
                  <div class="mfu-violation-plate" style="color: #64748b;">PLATE: {{ item.plate }}</div>
                </div>
                <div class="mfu-violation-time" style="color: #94a3b8;">{{ item.time }}</div>
              </div>
            </div>
          </div>
        </CCol>
      </CRow>
=======
  <div class="mfu-page">
    <!-- Page Header -->
    <div class="mfu-page-header mb-4">
      <h1 class="mfu-page-title">Detection Intelligence</h1>
    </div>

    <!-- Top Stat Cards -->
    <CRow class="mb-4">
      <CCol md="3" class="mb-3">
        <div class="mfu-top-card">
          <div class="mfu-top-card-header">
            <div class="mfu-top-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <span class="mfu-top-card-tag mfu-tag--green">+12%</span>
          </div>
          <div class="mfu-top-card-label">TOTAL DETECTIONS</div>
          <div class="mfu-top-card-value">{{ totalDetections.toLocaleString() }}</div>
        </div>
      </CCol>
      <CCol md="3" class="mb-3">
        <div class="mfu-top-card">
          <div class="mfu-top-card-header">
            <div class="mfu-top-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <span class="mfu-top-card-tag mfu-tag--red">+4%</span>
          </div>
          <div class="mfu-top-card-label">CRITICAL VIOLATIONS</div>
          <div class="mfu-top-card-value">{{ criticalViolations.toLocaleString() }}</div>
        </div>
      </CCol>
      <CCol md="3" class="mb-3">
        <div class="mfu-top-card">
          <div class="mfu-top-card-header">
            <div class="mfu-top-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <span class="mfu-top-card-tag mfu-tag--muted">STABLE</span>
          </div>
          <div class="mfu-top-card-label">ACTIVE GATES</div>
          <div class="mfu-top-card-value">{{ String(activeGates).padStart(2, '0') }}</div>
        </div>
      </CCol>
      <CCol md="3" class="mb-3">
        <div class="mfu-top-card">
          <div class="mfu-top-card-header">
            <div class="mfu-top-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <span class="mfu-top-card-tag mfu-tag--green">-1.2s</span>
          </div>
          <div class="mfu-top-card-label">AVG RESPONSE TIME</div>
          <div class="mfu-top-card-value">4.8s</div>
        </div>
      </CCol>
    </CRow>

    <!-- Charts Row -->
    <CRow class="mb-4">
      <CCol lg="8" class="mb-3">
        <div class="mfu-chart-card">
          <div class="mfu-chart-card-header">
            <h3 class="mfu-chart-title">Peak Violation Times</h3>
            <div class="mfu-chart-toggle">
              <button
                :class="['mfu-toggle-btn', { active: timeRange === 'daily' }]"
                @click="timeRange = 'daily'"
              >Daily</button>
              <button
                :class="['mfu-toggle-btn', { active: timeRange === 'hourly' }]"
                @click="timeRange = 'hourly'"
              >Hourly</button>
            </div>
          </div>
          <div class="mfu-chart-body">
            <CChartBar :datasets="barData.datasets" :labels="barData.labels" :options="barOptions" style="height: 280px;" />
          </div>
        </div>
      </CCol>
      <CCol lg="4" class="mb-3">
        <div class="mfu-chart-card h-100">
          <div class="mfu-chart-card-header">
            <h3 class="mfu-chart-title">Violation Types</h3>
          </div>
          <div class="mfu-chart-body d-flex flex-column align-items-center justify-content-center">
            <div class="mfu-donut-wrapper">
              <CChartDoughnut :datasets="doughnutData.datasets" :labels="doughnutData.labels" :options="doughnutOptions" />
              <div class="mfu-donut-center">
                <span class="mfu-donut-percent">72%</span>
                <span class="mfu-donut-sublabel">UNAUTHORIZED</span>
              </div>
            </div>
            <div class="mfu-donut-legend mt-3">
              <span class="mfu-legend-dot"></span>
              <span class="mfu-legend-text">No Helmet</span>
              <span class="mfu-legend-value">72%</span>
            </div>
          </div>
        </div>
      </CCol>
    </CRow>

    <!-- Cross-Gate Comparison -->
    <div class="mfu-table-card">
      <div class="mfu-table-header">
        <h3 class="mfu-table-title">Cross-Gate Comparison</h3>
        <span class="mfu-table-sync">Sync Time: Just Now</span>
      </div>
      <div class="mfu-table-responsive">
        <table class="mfu-table">
          <thead>
            <tr>
              <th>CAMPUS GATE NAME</th>
              <th>DETECTIONS</th>
              <th>VIOLATIONS</th>
              <th>COMPLIANCE RATE</th>
              <th>SECURITY STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in comparisonRows" :key="row.name">
              <td class="mfu-td-bold">{{ row.name }}</td>
              <td>{{ row.detections }}</td>
              <td>{{ row.violations }}</td>
              <td>
                <div class="mfu-compliance-bar-wrap">
                  <div class="mfu-compliance-bar">
                    <div
                      class="mfu-compliance-fill"
                      :style="{ width: row.rate + '%', background: getComplianceColor(row.rate) }"
                    ></div>
                  </div>
                </div>
              </td>
              <td>
                <span :class="['mfu-status-tag', 'mfu-status--' + row.statusClass]">{{ row.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
>>>>>>> Dashboard-UI-(Gus)
    </div>
  </div>
</template>

<script>
import { CChartBar, CChartDoughnut } from '@coreui/vue-chartjs'
import api from '@/service/api'
import securityAccess from '@/projects/mixins/securityAccess'

export default {
  name: 'Dashboard',
  mixins: [securityAccess],
  components: {
    CChartBar,
    CChartDoughnut
  },
  data() {
    return {
<<<<<<< HEAD
      violationToday: 0,
      violationLastHour: 0,
      violationsWeek: 0,
      violationsMonth: 0,
      totalViolation: 0,
      activeCameras: 0,
      chartRange: '24h',
      recentViolations: [],
=======
      timeRange: 'hourly',
      totalDetections: 0,
      criticalViolations: 0,
      activeGates: 0,
      detectionRate: 0,
>>>>>>> Dashboard-UI-(Gus)
      hourlyTrendData: [],
      dailyTrendData: [],
      apiTypeBreakdown: [],
      apiConnected: false,
      barOptions: {
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
      },
      doughnutData: {
        labels: ['No Helmet', 'Other'],
        datasets: [{
          backgroundColor: ['#991b1b', '#fecdd3'],
          borderWidth: 0,
          data: [72, 28]
        }]
      },
      doughnutOptions: {
        maintainAspectRatio: false,
        legend: { display: false },
        cutoutPercentage: 72,
        tooltips: {
          backgroundColor: '#0f172a',
          cornerRadius: 8
        }
      },
      comparisonRows: [
        { name: 'Main Gate (Phahonyothin)', detections: '5,821', violations: 42, rate: 92, status: 'OPTIMAL', statusClass: 'optimal' },
        { name: 'Dormitory Gate', detections: '2,110', violations: 88, rate: 76, status: 'MODERATE', statusClass: 'moderate' },
        { name: 'Medical Center Gate', detections: '4,302', violations: 15, rate: 95, status: 'OPTIMAL', statusClass: 'optimal' },
        { name: 'Stadium Rear Access', detections: '942', violations: 41, rate: 63, status: 'CRITICAL', statusClass: 'critical' }
      ]
    }
  },
  computed: {
<<<<<<< HEAD
    isAdmin() {
      return this.canViewPath('/newsystem/registry')
    },
    trendData() {
      if (this.chartRange === '24h') {
=======
    barData() {
      if (this.timeRange === 'hourly') {
>>>>>>> Dashboard-UI-(Gus)
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
<<<<<<< HEAD
              backgroundColor: data.map(function (v) {
                return v > 50 ? '#a31d1d' : v > 20 ? '#d4bebe' : '#f0e4e4'
              }),
=======
              backgroundColor: data.map(function (v) { return v > 50 ? '#991b1b' : v > 20 ? '#f87171' : '#fecdd3' }),
>>>>>>> Dashboard-UI-(Gus)
              borderRadius: 6,
              barPercentage: 0.55,
              data: data
            }]
          }
        }
        return {
          labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
          datasets: [{
            label: 'Violations',
<<<<<<< HEAD
            backgroundColor: [
              '#f0e4e4', '#f0e4e4', '#d4bebe', '#a31d1d',
              '#a31d1d', '#d4bebe', '#f0e4e4', '#f0e4e4', '#f0e4e4'
            ],
=======
            backgroundColor: ['#fecdd3', '#fecdd3', '#f87171', '#991b1b', '#991b1b', '#f87171', '#fecdd3', '#fecdd3', '#fecdd3'],
>>>>>>> Dashboard-UI-(Gus)
            borderRadius: 6,
            barPercentage: 0.55,
            data: [22, 35, 52, 78, 65, 48, 30, 25, 18]
          }]
        }
      }
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
<<<<<<< HEAD
            backgroundColor: data7.map(function (v) {
              return v > 30 ? '#a31d1d' : v > 15 ? '#d4bebe' : '#f0e4e4'
            }),
=======
            backgroundColor: data7.map(function (v) { return v > 30 ? '#991b1b' : v > 15 ? '#f87171' : '#fecdd3' }),
>>>>>>> Dashboard-UI-(Gus)
            borderRadius: 6,
            barPercentage: 0.55,
            data: data7
          }]
        }
      }
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Violations',
<<<<<<< HEAD
          backgroundColor: [
            '#f0e4e4', '#d4bebe', '#a31d1d', '#d4bebe',
            '#f0e4e4', '#f0e4e4', '#f0e4e4'
          ],
=======
          backgroundColor: ['#fecdd3', '#f87171', '#991b1b', '#f87171', '#fecdd3', '#fecdd3', '#fecdd3'],
>>>>>>> Dashboard-UI-(Gus)
          borderRadius: 6,
          barPercentage: 0.55,
          data: [145, 210, 280, 195, 110, 85, 60]
        }]
      }
    }
  },
  mounted() {
    this.fetchAnalyticsData()
  },
  methods: {
    async fetchAnalyticsData() {
      try {
<<<<<<< HEAD
        // Fetch stats
        var statsRes = await api.mfuVision('stats')
        if (statsRes && statsRes.data && statsRes.data.data) {
          var s = statsRes.data.data
          this.violationToday = s.violations_today || 0
          this.violationLastHour = s.violations_last_hour || 0
          this.violationsWeek = s.violations_week || 0
          this.violationsMonth = s.violations_month || 0
          this.totalViolation = s.total_records || 0
          this.activeCameras = s.active_cameras || 0
=======
        var res = await api.mfuVision('stats')
        if (res && res.data && res.data.data) {
          var s = res.data.data
          this.totalDetections = s.total_records || 0
          this.criticalViolations = s.violations_today || 0
          this.activeGates = s.active_cameras || 0
          this.detectionRate = s.detection_rate || 0
>>>>>>> Dashboard-UI-(Gus)
          this.hourlyTrendData = s.hourly_trend || []
          this.dailyTrendData = s.daily_trend || []
          this.apiConnected = true

          // Update doughnut from type_breakdown
          if (s.type_breakdown && s.type_breakdown.length > 0) {
            var total = s.type_breakdown.reduce(function (sum, t) { return sum + t.count }, 0)
            var noHelmet = 0
            s.type_breakdown.forEach(function (t) {
              if (t._id === 'no_helmet') noHelmet = t.count
            })
            var pct = total > 0 ? Math.round((noHelmet / total) * 100) : 0
            this.doughnutData = {
              labels: ['No Helmet', 'Other'],
              datasets: [{
                backgroundColor: ['#991b1b', '#fecdd3'],
                borderWidth: 0,
                data: [pct, 100 - pct]
              }]
            }
          }

          // Update cross-gate table from location_breakdown
          if (s.location_breakdown && s.location_breakdown.length > 0) {
            this.comparisonRows = s.location_breakdown.map(function (loc) {
              var complianceRate = loc.total > 0 ? Math.round(((loc.total - loc.noHelmet) / loc.total) * 100) : 100
              var statusInfo = complianceRate >= 90 ? { status: 'OPTIMAL', statusClass: 'optimal' }
                : complianceRate >= 70 ? { status: 'MODERATE', statusClass: 'moderate' }
                : { status: 'CRITICAL', statusClass: 'critical' }
              return {
                name: loc._id || 'Unknown',
                detections: loc.total.toLocaleString(),
                violations: loc.noHelmet,
                rate: complianceRate,
                status: statusInfo.status,
                statusClass: statusInfo.statusClass
              }
            })
          }
        }
      } catch (err) {
        // API not available - keep mock data
        this.totalDetections = 14282
        this.criticalViolations = 186
        this.activeGates = 1
        this.detectionRate = 72
      }
    },
<<<<<<< HEAD
    applyMockData() {
      this.violationToday = 1000
      this.violationLastHour = 500
      this.activeCameras = 1
      this.violationsWeek = 1000
      this.violationsMonth = 1000
      this.totalViolation = 1000
      this.recentViolations = [
        { type: 'No Helmet Detected', location: 'Post guard gate - IN', plate: '1กก-8822', time: '2m ago', image: 'https://placehold.co/80x60/1f2937/94a3b8?text=CAM' },
        { type: 'No Helmet Detected', location: 'Post guard gate - OUT', plate: '3กb-1234', time: '8m ago', image: 'https://placehold.co/80x60/1f2937/94a3b8?text=CAM' },
        { type: 'No Helmet Detected', location: 'Post guard gate - IN', plate: 'ABD-123', time: '14m ago', image: 'https://placehold.co/80x60/1f2937/94a3b8?text=CAM' }
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
=======
    getComplianceColor(rate) {
      if (rate >= 90) return 'linear-gradient(90deg, #22c55e, #4ade80)'
      if (rate >= 70) return 'linear-gradient(90deg, #eab308, #facc15)'
      return 'linear-gradient(90deg, #ef4444, #f87171)'
>>>>>>> Dashboard-UI-(Gus)
    }
  }
}
</script>

<style scoped>
.mfu-page {
  padding: 0.5rem;
}

.mfu-page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0;
}

/* Top Cards */
.mfu-top-card {
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  height: 100%;
  transition: box-shadow 0.2s ease;
}
.mfu-top-card:hover {
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
}
.mfu-top-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}
.mfu-top-card-icon {
  width: 36px;
  height: 36px;
  background: #f8fafc;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mfu-top-card-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
}
.mfu-top-card-value {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}
.mfu-top-card-tag {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
}
.mfu-tag--green { color: #16a34a; }
.mfu-tag--red { color: #dc2626; }
.mfu-tag--muted { color: #64748b; font-size: 0.7rem; }

/* Chart Card */
.mfu-chart-card {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}
.mfu-chart-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}
.mfu-chart-title {
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
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mfu-toggle-btn.active {
  background: #991b1b;
  color: #ffffff;
}
.mfu-toggle-btn:hover:not(.active) {
  background: #f8fafc;
}
.mfu-chart-body {
  padding: 1.5rem;
}

/* Donut */
.mfu-donut-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
}
.mfu-donut-wrapper canvas {
  max-height: 200px;
}
.mfu-donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.mfu-donut-percent {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #991b1b;
  line-height: 1;
}
.mfu-donut-sublabel {
  display: block;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #64748b;
  margin-top: 0.25rem;
}
.mfu-donut-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0 1rem;
}
.mfu-legend-dot {
  width: 10px;
  height: 10px;
  background: #991b1b;
  border-radius: 50%;
  flex-shrink: 0;
}
.mfu-legend-text {
  color: #0f172a;
  font-size: 0.85rem;
  font-weight: 500;
}
.mfu-legend-value {
  margin-left: auto;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Table */
.mfu-table-card {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}
.mfu-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
}
.mfu-table-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.mfu-table-sync {
  color: #94a3b8;
  font-size: 0.8rem;
}
.mfu-table-responsive {
  overflow-x: auto;
}
.mfu-table {
  width: 100%;
  border-collapse: collapse;
}
.mfu-table thead tr {
  background: #1e293b;
}
.mfu-table thead th {
  padding: 0.85rem 1.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #94a3b8;
  text-transform: uppercase;
  text-align: left;
  white-space: nowrap;
}
.mfu-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}
.mfu-table tbody tr:hover {
  background: #fafbfc;
}
.mfu-table tbody td {
  padding: 1rem 1.25rem;
  font-size: 0.9rem;
  color: #334155;
  vertical-align: middle;
}
.mfu-td-bold {
  font-weight: 600;
  color: #0f172a;
}

/* Compliance Bar */
.mfu-compliance-bar-wrap {
  min-width: 120px;
}
.mfu-compliance-bar {
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}
.mfu-compliance-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease;
}

/* Status Tags */
.mfu-status-tag {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.mfu-status--optimal {
  background: #d1fae5;
  color: #166534;
}
.mfu-status--moderate {
  background: #fef3c7;
  color: #92400e;
}
.mfu-status--critical {
  background: #fee2e2;
  color: #991b1b;
}

/* User Dashboard specific styles */
.user-stat-card {
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(163, 29, 29, 0.05), 0 8px 24px rgba(163, 29, 29, 0.03);
  height: 100%;
}
.border-card {
  border: 1px solid #a31d1d;
}
.solid-card {
  background-color: #a31d1d;
  color: #ffffff;
}
.user-stat-icon-wrap {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}
.user-stat-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}
.user-stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #0f172a;
}
.user-chart-panel {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  height: 100%;
}
.user-chart-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}
.user-chart-panel-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.user-violations-panel {
  background: #ebdcdc;
  border: 1px solid #d4bebe;
  border-radius: 1rem;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.user-violations-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #d4bebe;
}
.user-violations-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
</style>
