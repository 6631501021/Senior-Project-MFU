<template>
  <div class="mfu-page">
    <!-- Page Header -->
    <div class="mfu-page-header d-flex flex-wrap justify-content-between align-items-start mb-4">
      <div>
        <h1 class="mfu-page-title">Detection Intelligence</h1>
        <p class="mfu-page-subtitle">Monitor helmet-detection trends, gate performance, and alert volume from campus camera records.</p>
      </div>
      <div class="mfu-export-panel-simple">
        <button class="mfu-export-btn" @click="openExportModal" title="open  data export options">
          Export
        </button>
      </div>
    </div>

    <div v-if="showExportModal" class="mfu-modal-overlay" @click.self="closeExportModal">
      <div class="mfu-modal-container mfu-date-picker-card">
        <div class="mfu-date-picker-top">
          <div>
            <span class="mfu-date-picker-kicker">📝 Export Report Options</span>
            <p class="mfu-export-modal-help">กรุณาเลือกช่วงวันที่ของข้อมูล Records ที่คุณต้องการส่งออกเป็นรายงาน</p>
          </div>
          <button class="mfu-modal-close-btn" @click="closeExportModal" title="Close export options">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="mfu-date-range-fields">
          <button
            :class="['mfu-date-range-field', { active: exportActiveDateField === 'start' }]"
            @click="setExportActiveDateField('start')"
          >
            <span>วันที่เริ่มต้น</span>
            <strong>{{ exportRange.start ? formatExportDateLabel(exportRange.start) : 'Select date' }}</strong>
          </button>
          <span class="mfu-date-range-separator">ถึง</span>
          <button
            :class="['mfu-date-range-field', { active: exportActiveDateField === 'end' }]"
            @click="setExportActiveDateField('end')"
          >
            <span>วันที่สิ้นสุด</span>
            <strong>{{ exportRange.end ? formatExportDateLabel(exportRange.end) : 'Select date' }}</strong>
          </button>
        </div>
        <div class="mfu-date-picker-divider"></div>
        <div class="mfu-date-picker-monthbar">
          <button class="mfu-month-label-btn" @click="toggleMonthYearPicker" title="Select month and year">
            {{ exportMonthLabel }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5H7z"/></svg>
          </button>
          <div class="mfu-month-nav">
            <button class="mfu-month-nav-btn" @click="shiftExportMonth(-1)" title="Previous month">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="mfu-month-nav-btn" @click="shiftExportMonth(1)" title="Next month">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <!-- Month/Year Picker Dropdown -->
        <div v-if="showMonthYearPicker" class="mfu-my-picker">
          <div class="mfu-my-picker-yearbar">
            <button class="mfu-month-nav-btn" @click="shiftPickerYear(-1)" title="Previous year">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="mfu-my-picker-year">{{ pickerYear }}</span>
            <button class="mfu-month-nav-btn" @click="shiftPickerYear(1)" title="Next year">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div class="mfu-my-picker-grid">
            <button
              v-for="(m, i) in monthNames"
              :key="i"
              :class="['mfu-my-picker-cell', { active: isCurrentPickerMonth(i) }]"
              @click="selectMonthYear(i)"
            >{{ m }}</button>
          </div>
        </div>

        <div class="mfu-date-weekdays">
          <span v-for="(day, index) in exportWeekdays" :key="index">{{ day }}</span>
        </div>
        <div class="mfu-date-grid">
          <button
            v-for="cell in exportCalendarCells"
            :key="cell.key"
            :class="[
              'mfu-date-cell',
              {
                'is-empty': !cell.date,
                'is-selected': cell.date === exportRange.start || cell.date === exportRange.end,
                'is-in-range': isDateInExportRange(cell.date)
              }
            ]"
            :disabled="!cell.date"
            @click="selectExportDate(cell.date)"
          >
            {{ cell.day }}
          </button>
        </div>

        <div class="mfu-date-actions">
          <button class="mfu-btn-secondary" @click="closeExportModal">Cancel</button>
          <button class="mfu-export-btn" @click="handleExportReport">OK</button>
        </div>
      </div>
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
          <p class="mfu-top-card-subtext">All detection events captured by active cameras within the current analytics window.</p>
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
          <p class="mfu-top-card-subtext">High-priority violations that need security review or follow-up action.</p>
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
          <div class="mfu-top-card-label">ACTIVE CAMERA</div>
          <p class="mfu-top-card-subtext">Camera-connected campus gates currently included in detection monitoring.</p>
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
          <p class="mfu-top-card-subtext">Average time from detection event to alert visibility for operators.</p>
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
            <p class="mfu-chart-subtitle">Shows when violations most frequently occur so patrol coverage can be planned.</p>
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
            <p class="mfu-chart-subtitle">Breakdown of detected violation categories from the selected dataset.</p>
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
        <div>
          <h3 class="mfu-table-title">Cross-Gate Comparison</h3>
          <p class="mfu-table-subtitle">Compares detections, violations, and compliance health across monitored gates.</p>
        </div>
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
      timeRange: 'hourly',
      showExportModal: false,
      totalDetections: 0,
      criticalViolations: 0,
      activeGates: 0,
      detectionRate: 0,
      exportRange: {
        start: '',
        end: ''
      },
      exportActiveDateField: 'start',
      exportCalendarDate: new Date(),
      showMonthYearPicker: false,
      pickerYear: new Date().getFullYear(),
      monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      exportWeekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
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
    isAdmin() {
      const profile = this.$store.getters['auth/profile']
      const role = profile?.role || (profile?.userinfo && profile.userinfo.role) || ''
      return role === 'admin' || this.canViewPath('/newsystem/registry')
    },
    exportMonthLabel() {
      return this.exportCalendarDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    },
    exportCalendarCells() {
      var year = this.exportCalendarDate.getFullYear()
      var month = this.exportCalendarDate.getMonth()
      var firstDay = new Date(year, month, 1).getDay()
      var daysInMonth = new Date(year, month + 1, 0).getDate()
      var cells = []

      for (var blank = 0; blank < firstDay; blank++) {
        cells.push({ key: 'blank-' + blank, day: '', date: '' })
      }

      for (var day = 1; day <= daysInMonth; day++) {
        cells.push({
          key: 'day-' + day,
          day: day,
          date: this.formatDateValue(new Date(year, month, day))
        })
      }

      while (cells.length % 7 !== 0) {
        cells.push({ key: 'tail-' + cells.length, day: '', date: '' })
      }

      return cells
    },
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
  beforeDestroy() {
    document.body.style.overflow = ''
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
    },
    openExportModal() {
      this.exportRange.start = ''
      this.exportRange.end = ''
      this.exportActiveDateField = 'start'
      this.exportCalendarDate = new Date()
      this.showExportModal = true
      document.body.style.overflow = 'hidden'
    },
    closeExportModal() {
      this.showExportModal = false
      document.body.style.overflow = ''
    },
    formatDateValue(date) {
      var year = date.getFullYear()
      var month = String(date.getMonth() + 1).padStart(2, '0')
      var day = String(date.getDate()).padStart(2, '0')
      return year + '-' + month + '-' + day
    },
    parseDateValue(value) {
      if (!value) return new Date()
      var parts = value.split('-').map(function (part) { return Number(part) })
      return new Date(parts[0], parts[1] - 1, parts[2])
    },
    formatExportDateLabel(value) {
      return this.parseDateValue(value).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    },
    setExportActiveDateField(field) {
      this.exportActiveDateField = field
    },
    selectExportDate(date) {
      if (!date) return
      if (this.exportActiveDateField === 'start') {
        this.exportRange.start = date
        // If end date exists and is before new start, reset it
        if (this.exportRange.end && this.exportRange.end < date) {
          this.exportRange.end = ''
        }
        // Auto-switch to end date field
        this.exportActiveDateField = 'end'
      } else {
        // If selected end date is before start, swap them
        if (this.exportRange.start && date < this.exportRange.start) {
          this.exportRange.end = this.exportRange.start
          this.exportRange.start = date
        } else {
          this.exportRange.end = date
        }
      }
    },
    isDateInExportRange(date) {
      if (!date || !this.exportRange.start || !this.exportRange.end) return false
      return date > this.exportRange.start && date < this.exportRange.end
    },
    shiftExportMonth(direction) {
      var nextMonth = new Date(
        this.exportCalendarDate.getFullYear(),
        this.exportCalendarDate.getMonth() + direction,
        1
      )
      this.exportCalendarDate = nextMonth
      this.showMonthYearPicker = false
    },
    toggleMonthYearPicker() {
      this.showMonthYearPicker = !this.showMonthYearPicker
      if (this.showMonthYearPicker) {
        this.pickerYear = this.exportCalendarDate.getFullYear()
      }
    },
    shiftPickerYear(direction) {
      this.pickerYear += direction
    },
    selectMonthYear(monthIndex) {
      this.exportCalendarDate = new Date(this.pickerYear, monthIndex, 1)
      this.showMonthYearPicker = false
    },
    isCurrentPickerMonth(monthIndex) {
      return this.exportCalendarDate.getFullYear() === this.pickerYear &&
        this.exportCalendarDate.getMonth() === monthIndex
    },
    handleExportReport() {
      if (!this.exportRange.start || !this.exportRange.end) {
        alert('กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุดให้ครบถ้วน')
        return
      }
      console.log('[Dashboard] Processing report export with range:', {
        start: this.exportRange.start,
        end: this.exportRange.end
      })

      this.closeExportModal()
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
.mfu-page-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0.35rem 0 0;
  max-width: 720px;
}

.mfu-export-panel-simple {
  display: flex;
  align-items: center;
}

.mfu-export-panel {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.mfu-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1.5rem;
}
.mfu-modal-container {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 1.35rem;
  box-shadow: 0 30px 70px -24px rgba(15, 23, 42, 0.55);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
}
.mfu-date-picker-card {
  max-width: 398px;
  padding: 0;
}
.mfu-modal--small {
  max-width: 540px;
}
.mfu-date-picker-top {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem 0.5rem;
}
.mfu-date-picker-kicker {
  color: #666666;
  font-size: 1rem;
  font-weight: 600;
}
.mfu-modal-header {
  align-items: center;
  background: #ffffff;
  border-bottom: 0;
  display: flex;
  justify-content: space-between;
  padding: 1.45rem 1.9rem 0.75rem;
}
.mfu-modal-body {
  background: #ffffff;
  color: #0f172a;
  padding: 1rem 1.9rem 1.85rem !important;
}
.mfu-modal-title-text {
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 700;
}
.mfu-modal-close-btn {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 0.375rem;
  color: #94a3b8;
  cursor: pointer;
  display: inline-flex;
  height: 2rem;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
  width: 2rem;
}
.mfu-modal-close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}
.mfu-date-picker-selected {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 1.6rem 1.5rem 1.25rem;
}
.mfu-date-picker-selected span {
  color: #555555;
  font-size: 2rem;
  font-weight: 400;
  line-height: 1;
}
.mfu-date-edit-btn,
.mfu-month-label-btn,
.mfu-month-nav-btn,
.mfu-date-cell {
  appearance: none;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0;
}
.mfu-date-edit-btn {
  color: #7a7a7a;
  display: inline-flex;
}
.mfu-date-picker-divider {
  background: #e0e0e0;
  height: 1px;
  width: 100%;
}
.mfu-date-range-fields {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
}
.mfu-date-range-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  padding: 0.6rem 0.85rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.65rem;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.mfu-date-range-field span {
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.02em;
}
.mfu-date-range-field strong {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}
.mfu-date-range-field.active {
  border-color: #9c00c8;
  background: #faf5ff;
}
.mfu-date-range-field.active span {
  color: #9c00c8;
}
.mfu-date-range-separator {
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
  flex-shrink: 0;
}
.mfu-date-cell.is-in-range {
  background: #f3e8ff;
  color: #7c3aed;
  border-radius: 0;
}
.mfu-date-picker-monthbar {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem 1.15rem;
}
.mfu-month-label-btn {
  align-items: center;
  color: #666666;
  display: inline-flex;
  font-size: 1rem;
  font-weight: 600;
  gap: 0.35rem;
  border-radius: 0.5rem;
  padding: 0.3rem 0.55rem;
  transition: background 0.2s ease;
}
.mfu-month-label-btn:hover {
  background: #f1f5f9;
}
.mfu-month-nav {
  display: flex;
  gap: 1.05rem;
}
.mfu-month-nav-btn {
  color: #8a8a8a;
  display: inline-flex;
}
/* Month/Year Picker */
.mfu-my-picker {
  padding: 0.75rem 1.5rem 1rem;
  border-top: 1px solid #e0e0e0;
}
.mfu-my-picker-yearbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.mfu-my-picker-year {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}
.mfu-my-picker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}
.mfu-my-picker-cell {
  appearance: none;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  color: #555555;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.55rem 0;
  text-align: center;
  transition: all 0.15s ease;
}
.mfu-my-picker-cell:hover {
  background: #f3e8ff;
  color: #7c3aed;
}
.mfu-my-picker-cell.active {
  background: #9c00c8;
  border-color: #9c00c8;
  color: #ffffff;
}
.mfu-date-weekdays,
.mfu-date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0 1.5rem;
}
.mfu-date-weekdays {
  color: #555555;
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0.55rem;
  text-align: center;
}
.mfu-date-weekdays span {
  align-items: center;
  display: flex;
  height: 2rem;
  justify-content: center;
}
.mfu-date-grid {
  row-gap: 0.2rem;
}
.mfu-date-cell {
  align-items: center;
  border-radius: 999px;
  color: #555555;
  display: flex;
  font-size: 1.25rem;
  height: 2.7rem;
  justify-content: center;
  margin: 0 auto;
  transition: background 0.2s ease, color 0.2s ease;
  width: 2.7rem;
}
.mfu-date-cell:hover:not(.is-empty):not(.is-selected) {
  background: #f3e8ff;
}
.mfu-date-cell.is-empty {
  cursor: default;
  visibility: hidden;
}
.mfu-date-cell.is-selected {
  background: #9c00c8;
  color: #ffffff;
}
.mfu-date-actions {
  align-items: center;
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
  padding: 1.65rem 1.55rem 1.4rem;
}
.mfu-export-modal-help {
  color: #64748b !important;
  font-size: 0.85rem;
  line-height: 1.45;
}
.mfu-export-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #64748b;
  margin-bottom: 0.35rem;
}
.mfu-export-inputs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.mfu-export-input {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  color: #0f172a;
  font-size: 0.8rem;
  padding: 0.45rem 0.55rem;
}
.mfu-export-modal-input {
  background: #ffffff;
  border: 1px solid #241842;
  border-radius: 0.5rem;
  color: #0f172a;
  font-size: 0.95rem;
  outline: none;
  padding: 0.7rem 0.85rem;
  width: 100%;
}
.mfu-export-modal-input:focus {
  border-color: #991b1b;
  box-shadow: 0 0 0 2px rgba(153, 27, 27, 0.4);
}
.mfu-modal-overlay .mfu-export-label {
  color: #64748b !important;
}
.mfu-export-btn {
  border: none;
  border-radius: 0.5rem;
  background: #991b1b;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.55rem 1rem;
  cursor: pointer;
}
.mfu-btn-secondary {
  border: 1px solid #e2e8f0;
  background: transparent;
  color: #64748b;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.55rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mfu-btn-secondary:hover {
  background: #f1f5f9;
  color: #334155;
}

.mfu-modal-overlay .mfu-export-btn {
  background: #991b1b !important;
  color: #ffffff !important;
  border: 1px solid #b91c1c !important;
  border-radius: 0.5rem !important;
  font-size: 0.875rem !important;
  font-weight: 700 !important;
  padding: 0.6rem 1.5rem !important;
  cursor: pointer !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.2s ease !important;
}

.mfu-modal-overlay .mfu-export-btn:hover {
  background: #b91c1c !important;
  border-color: #dc2626 !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
  transform: translateY(-1px);
}

.mfu-modal-overlay .mfu-btn-secondary {
  background: transparent !important;
  color: #64748b !important;
  border: 1px solid transparent !important;
  border-radius: 0.5rem !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  padding: 0.6rem 1.5rem !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.mfu-modal-overlay .mfu-btn-secondary:hover {
  background: #f1f5f9 !important;
  color: #334155 !important;
  border-color: #e2e8f0 !important;
}
.mfu-date-actions .mfu-export-btn,
.mfu-date-actions .mfu-btn-secondary {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  color: #9c00c8 !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  min-height: auto !important;
  padding: 0.35rem 0.25rem !important;
  transform: none !important;
}
.mfu-date-actions .mfu-export-btn:hover,
.mfu-date-actions .mfu-btn-secondary:hover {
  background: transparent !important;
  border: 0 !important;
  color: #7b00a3 !important;
  box-shadow: none !important;
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
.mfu-top-card-subtext {
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.35;
  margin: 0;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.35s ease, opacity 0.3s ease, margin 0.35s ease;
}
.mfu-top-card:hover .mfu-top-card-subtext {
  max-height: 4rem;
  opacity: 1;
  margin: 0 0 0.7rem;
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
  align-items: flex-start;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  gap: 1rem;
}
.mfu-chart-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.mfu-chart-subtitle,
.mfu-table-subtitle {
  color: #64748b;
  font-size: 0.8rem;
  margin: 0.25rem 0 0;
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
