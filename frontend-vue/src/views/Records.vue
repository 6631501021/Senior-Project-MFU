<template>
  <div class="mfu-page">
    <!-- Breadcrumb -->
    <div class="mfu-breadcrumb">RECORDS</div>

    <!-- Page Header -->
    <div class="mfu-page-header mb-4">
      <h1 class="mfu-page-title">Detection Records</h1>
      <p class="mfu-page-subtitle">Review historical security data and archived violation detections across the campus ecosystem.</p>
    </div>

    <!-- Filter Card -->
    <div class="mfu-filter-card mb-4">
      <div class="mfu-filter-body">
        <div class="mfu-filter-row">
          <div class="mfu-filter-group">
            <label class="mfu-filter-label">DATE RANGE</label>
            <input type="date" class="mfu-filter-input" v-model="filters.dateRange" placeholder="Select dates..." />
          </div>
          <div class="mfu-filter-group">
            <label class="mfu-filter-label">VIOLATION TYPE</label>
            <select class="mfu-filter-select" v-model="filters.type">
              <option value="">All Types</option>
              <option value="no_helmet">No Helmet</option>
              <option value="unauthorized">Unauthorized Entry</option>
            </select>
          </div>
          <div class="mfu-filter-group">
            <label class="mfu-filter-label">LOCATION</label>
            <select class="mfu-filter-select" v-model="filters.location">
              <option value="">All Locations</option>
              <option value="main_gate">Main Gate</option>
              <option value="dormitory">Dormitory Gate</option>
              <option value="medical">Medical Center Gate</option>
            </select>
          </div>
          <div class="mfu-filter-group mfu-filter-group--row-count">
            <label class="mfu-filter-label">ROWS</label>
            <div class="mfu-row-count-buttons">
              <button
                type="button"
                class="mfu-btn mfu-btn--outline"
                :class="{ active: perPage === 5 }"
                @click="setRowCount(5)"
              >5</button>
              <button
                type="button"
                class="mfu-btn mfu-btn--outline"
                :class="{ active: perPage === 10 }"
                @click="setRowCount(10)"
              >10</button>
              <button
                type="button"
                class="mfu-btn mfu-btn--outline"
                :class="{ active: perPage === 20 }"
                @click="setRowCount(20)"
              >20</button>
            </div>
          </div>
          <div class="mfu-filter-actions">
            <button class="mfu-btn mfu-btn--primary" @click="applyFilter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Apply Filters
            </button>
            <button class="mfu-btn mfu-btn--outline" @click="resetFilter">Reset</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stat Badges -->
    <div class="mfu-stat-badges mb-4">
      <div class="mfu-stat-badge-item">
        <span class="mfu-stat-badge-label">TOTAL RECORDS</span>
        <span class="mfu-stat-badge-value">{{ totalRecords.toLocaleString() }}</span>
      </div>
      <div class="mfu-stat-badge-item">
        <span class="mfu-stat-badge-label mfu-stat-badge-label--red">NO HELMET</span>
        <span class="mfu-stat-badge-value">{{ noHelmetCount }}</span>
      </div>
    </div>

    <!-- Data Table -->
    <div class="mfu-table-card">
      <div class="mfu-table-responsive">
        <table class="mfu-table">
          <thead>
            <tr>
              <th>NUMBER</th>
              <th>TIMESTAMP</th>
              <th>TYPE</th>
              <th>IMAGE PREVIEW</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in records" :key="row._id || idx">
              <td>{{ (currentPage - 1) * perPage + idx + 1 }}</td>
              <td class="mfu-td-timestamp">{{ formatTimestamp(row.timestamp) }}</td>
              <td>
                <span class="mfu-type-badge">{{ formatType(row.violation_type) }}</span>
              </td>
              <td>
                <img :src="row.image_url || 'https://placehold.co/120x72/334155/94a3b8?text=CAM'" :alt="'Record ' + (idx + 1)" class="mfu-preview-img" />
              </td>
              <td>
                <router-link :to="'/mfu/records/' + row._id" class="mfu-view-link">VIEW DETAILS</router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div class="mfu-pagination">
        <span class="mfu-pagination-info">SHOWING {{ paginationStart }}-{{ paginationEnd }} OF {{ totalRecords.toLocaleString() }} DETECTIONS</span>
        <div class="mfu-pagination-buttons">
          <button class="mfu-page-btn" :disabled="currentPage === 1" @click="currentPage--">&lt;</button>
          <button
            v-for="p in displayPages"
            :key="p"
            :class="['mfu-page-btn', { active: p === currentPage, dots: p === '...' }]"
            @click="p !== '...' && (currentPage = p)"
            :disabled="p === '...'"
          >{{ p }}</button>
          <button class="mfu-page-btn" :disabled="currentPage === totalPages" @click="currentPage++">&gt;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/service/api'

const mockRecords = [
  { _id: 'mock-1', timestamp: '2023-11-24T14:32:01Z', violation_type: 'no_helmet', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-01' },
  { _id: 'mock-2', timestamp: '2023-11-24T14:22:40Z', violation_type: 'unauthorized_entry', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-02' },
  { _id: 'mock-3', timestamp: '2023-11-24T14:28:12Z', violation_type: 'speeding', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-03' },
  { _id: 'mock-4', timestamp: '2023-11-24T14:15:59Z', violation_type: 'no_helmet', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-04' },
  { _id: 'mock-5', timestamp: '2023-11-24T14:05:25Z', violation_type: 'other', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-05' },
  { _id: 'mock-6', timestamp: '2023-11-24T13:55:18Z', violation_type: 'no_helmet', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-06' },
  { _id: 'mock-7', timestamp: '2023-11-24T13:44:50Z', violation_type: 'unauthorized_entry', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-07' },
  { _id: 'mock-8', timestamp: '2023-11-24T13:38:08Z', violation_type: 'no_helmet', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-08' },
  { _id: 'mock-9', timestamp: '2023-11-24T13:25:44Z', violation_type: 'speeding', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-09' },
  { _id: 'mock-10', timestamp: '2023-11-24T13:12:30Z', violation_type: 'other', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-10' },
  { _id: 'mock-11', timestamp: '2023-11-24T13:02:15Z', violation_type: 'no_helmet', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-11' },
  { _id: 'mock-12', timestamp: '2023-11-24T12:52:03Z', violation_type: 'unauthorized_entry', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-12' },
  { _id: 'mock-13', timestamp: '2023-11-24T12:42:20Z', violation_type: 'speeding', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-13' },
  { _id: 'mock-14', timestamp: '2023-11-24T12:33:51Z', violation_type: 'other', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-14' },
  { _id: 'mock-15', timestamp: '2023-11-24T12:24:16Z', violation_type: 'no_helmet', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-15' },
  { _id: 'mock-16', timestamp: '2023-11-24T12:15:07Z', violation_type: 'unauthorized_entry', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-16' },
  { _id: 'mock-17', timestamp: '2023-11-24T12:05:44Z', violation_type: 'speeding', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-17' },
  { _id: 'mock-18', timestamp: '2023-11-24T11:55:21Z', violation_type: 'other', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-18' },
  { _id: 'mock-19', timestamp: '2023-11-24T11:44:49Z', violation_type: 'no_helmet', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-19' },
  { _id: 'mock-20', timestamp: '2023-11-24T11:35:05Z', violation_type: 'unauthorized_entry', image_url: 'https://placehold.co/120x72/334155/94a3b8?text=CAM-20' }
]

export default {
  name: 'Records',
  data() {
    return {
      filters: {
        dateRange: '',
        type: '',
        location: ''
      },
      totalRecords: mockRecords.length,
      noHelmetCount: mockRecords.filter(function (r) { return r.violation_type === 'no_helmet' }).length,
      currentPage: 1,
      perPage: 5,
      records: mockRecords.slice(0, 5),
      loading: false
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalRecords / this.perPage) || 1
    },
    paginationStart() {
      if (this.totalRecords === 0) return 0
      return (this.currentPage - 1) * this.perPage + 1
    },
    paginationEnd() {
      return Math.min(this.currentPage * this.perPage, this.totalRecords)
    },
    displayPages() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage

      if (total <= 5) {
        for (let i = 1; i <= total; i++) pages.push(i)
      } else {
        pages.push(1)
        if (current > 3) pages.push('...')
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
          pages.push(i)
        }
        if (current < total - 2) pages.push('...')
        pages.push(total)
      }
      return pages
    }
  },
  watch: {
    currentPage() {
      this.fetchRecords()
    }
  },
  mounted() {
    this.fetchRecords()
  },
  methods: {
    async fetchRecords() {
      this.loading = true
      try {
        var params = {
          page: this.currentPage,
          limit: this.perPage
        }
        if (this.filters.type) params.violation_type = this.filters.type
        if (this.filters.location) params.location = this.filters.location
        if (this.filters.dateRange) params.from = this.filters.dateRange

        var res = await api.mfuVision('records', params)
        if (res && res.data && res.data.data) {
          var data = res.data.data
          if (Array.isArray(data.records) && data.records.length > 0) {
            this.records = data.records
            if (data.pagination) {
              this.totalRecords = data.pagination.total || data.records.length
            }
            this.noHelmetCount = this.records.filter(function (r) { return r.violation_type === 'no_helmet' }).length
          }
        }
      } catch (err) {
        // API unavailable - apply mock data
        this.applyMockData(this.perPage, this.currentPage)
      }
      this.loading = false
    },
    applyMockData(count = this.perPage, page = this.currentPage) {
      var start = (page - 1) * count
      this.records = mockRecords.slice(start, start + count)
      this.totalRecords = mockRecords.length
      this.noHelmetCount = mockRecords.filter(function (r) { return r.violation_type === 'no_helmet' }).length
    },
    setRowCount(count) {
      if (this.perPage === count) return
      this.perPage = count
      this.currentPage = 1
      this.applyMockData(count, 1)
      this.fetchRecords()
    },
    applyFilter() {
      this.currentPage = 1
      this.fetchRecords()
    },
    resetFilter() {
      this.filters = { dateRange: '', type: '', location: '' }
      this.currentPage = 1
      this.fetchRecords()
    },
    formatTimestamp(ts) {
      if (!ts) return ''
      var d = new Date(ts)
      var date = d.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
      var time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      return date + '\n' + time
    },
    formatType(type) {
      var map = { no_helmet: 'NO HELMET', unauthorized_entry: 'UNAUTHORIZED', speeding: 'SPEEDING', other: 'OTHER' }
      return map[type] || (type || '').toUpperCase()
    }
  }
}
</script>

<style scoped>
.mfu-page {
  padding: 0.5rem;
}

.mfu-breadcrumb {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #991b1b;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.mfu-page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.mfu-page-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 0;
}

/* Filter Card */
.mfu-filter-card {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
}

.mfu-filter-body {
  padding: 1.5rem;
}

.mfu-filter-row {
  display: flex;
  gap: 1.25rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.mfu-filter-group {
  flex: 1;
  min-width: 160px;
}

.mfu-filter-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #0f172a;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.mfu-filter-input,
.mfu-filter-select {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  transition: border-color 0.2s ease;
}

.mfu-filter-group--row-count .mfu-row-count-buttons {
  display: flex;
  gap: 0.5rem;
}

.mfu-row-count-buttons .mfu-btn {
  min-width: 3rem;
  padding: 0.5rem 0.75rem;
}

.mfu-row-count-buttons .mfu-btn.active,
.mfu-row-count-buttons .mfu-btn.active:hover {
  background-color: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.mfu-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.mfu-btn--primary {
  background: #991b1b;
  color: #ffffff;
}

.mfu-btn--primary:hover {
  background: #7f1d1d;
}

.mfu-btn--outline {
  background: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.mfu-btn--outline:hover {
  background: #f8fafc;
}

/* Stat Badges */
.mfu-stat-badges {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.mfu-stat-badge-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
}

.mfu-stat-badge-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #991b1b;
  text-transform: uppercase;
}

.mfu-stat-badge-label--red {
  color: #dc2626;
}

.mfu-stat-badge-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

/* Table */
.mfu-table-card {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.mfu-table-responsive {
  overflow-x: auto;
}

.mfu-table {
  width: 100%;
  border-collapse: collapse;
}

.mfu-table thead tr {
  background: #0f172a;
}

.mfu-table thead th {
  padding: 1rem 1.25rem;
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

.mfu-td-timestamp {
  white-space: pre-line;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #475569;
}

.mfu-type-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: #fef2f2;
  color: #991b1b;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.mfu-preview-img {
  width: 100px;
  height: 64px;
  object-fit: cover;
  border-radius: 0.5rem;
  background: #f1f5f9;
}

.mfu-view-link {
  color: #991b1b;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: 0.05em;
  transition: color 0.15s ease;
}

.mfu-view-link:hover {
  color: #7f1d1d;
  text-decoration: underline;
}

/* Pagination */
.mfu-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.mfu-pagination-info {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.05em;
}

.mfu-pagination-buttons {
  display: flex;
  gap: 0.25rem;
}

.mfu-page-btn {
  min-width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.mfu-page-btn:hover:not(.active):not(.dots):not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.mfu-page-btn.active {
  background: #991b1b;
  color: #ffffff;
  border-color: #991b1b;
}

.mfu-page-btn.dots {
  border: none;
  cursor: default;
  background: transparent;
}

.mfu-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
