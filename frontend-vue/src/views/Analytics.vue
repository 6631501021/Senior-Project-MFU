<template>
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
    </div>
  </div>
</template>

<script>
import { CChartBar, CChartDoughnut } from '@coreui/vue-chartjs'
import api from '@/service/api'

export default {
  name: 'Analytics',
  components: {
    CChartBar,
    CChartDoughnut
  },
  data() {
    return {
      timeRange: 'hourly',
      totalDetections: 0,
      criticalViolations: 0,
      activeGates: 0,
      detectionRate: 0,
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
    barData() {
      if (this.timeRange === 'hourly') {
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
              backgroundColor: data.map(function (v) { return v > 50 ? '#991b1b' : v > 20 ? '#f87171' : '#fecdd3' }),
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
            backgroundColor: ['#fecdd3', '#fecdd3', '#f87171', '#991b1b', '#991b1b', '#f87171', '#fecdd3', '#fecdd3', '#fecdd3'],
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
            backgroundColor: data7.map(function (v) { return v > 30 ? '#991b1b' : v > 15 ? '#f87171' : '#fecdd3' }),
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
          backgroundColor: ['#fecdd3', '#f87171', '#991b1b', '#f87171', '#fecdd3', '#fecdd3', '#fecdd3'],
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
        var res = await api.mfuVision('stats')
        if (res && res.data && res.data.data) {
          var s = res.data.data
          this.totalDetections = s.total_records || 0
          this.criticalViolations = s.violations_today || 0
          this.activeGates = s.active_cameras || 0
          this.detectionRate = s.detection_rate || 0
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
    getComplianceColor(rate) {
      if (rate >= 90) return 'linear-gradient(90deg, #22c55e, #4ade80)'
      if (rate >= 70) return 'linear-gradient(90deg, #eab308, #facc15)'
      return 'linear-gradient(90deg, #ef4444, #f87171)'
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
</style>
