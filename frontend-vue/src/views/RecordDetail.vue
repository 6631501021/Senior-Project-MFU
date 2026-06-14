<template>
  <div class="mfu-page">
    <!-- Breadcrumb -->
    <div class="mfu-breadcrumb">
      <router-link to="/mfu/records" class="mfu-breadcrumb-link">{{ isAdmin ? 'RECORDS' : 'YOUR VIOLATION' }}</router-link>
      <span class="mfu-breadcrumb-sep">&gt;</span>
      <span class="mfu-breadcrumb-current">{{ isAdmin ? 'VIEW DETAILS' : 'DETAILS' }}</span>
    </div>

    <!-- Page Header -->
    <div class="mfu-detail-header">
      <div class="mfu-detail-header-left">
        <h1 class="mfu-detail-title">Detection Detail: #HV-{{ recordId }}</h1>
        <span :class="['mfu-status-badge', statusBadgeClass]">
          <span class="mfu-status-dot" :style="statusDotStyle"></span>
          {{ statusLabel }}
        </span>
      </div>
      <div class="mfu-detail-header-right" v-if="isAdmin">
        <button class="mfu-action-btn mfu-action-btn--ghost">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
        <button class="mfu-action-btn mfu-action-btn--outline-danger" @click="rejectRecord">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Reject
        </button>
        <button class="mfu-action-btn mfu-action-btn--primary" @click="approveRecord">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Approve Record
        </button>
      </div>
    </div>

    <CRow>
      <!-- Left: Evidence Image -->
      <CCol lg="7" class="mb-4">
        <div class="mfu-evidence-card">
          <div class="mfu-evidence-image-wrap">
            <div class="mfu-evidence-overlay-top">
              LIVE_FEED :: CAM01-G04 :: {{ record.timestamp }}
            </div>
            <img src="https://placehold.co/800x500/1f2937/64748b?text=EVIDENCE+IMAGE" alt="Detection Evidence" class="mfu-evidence-image" />
            <div class="mfu-evidence-overlay-bottom">
              <div class="mfu-evidence-confidence">
                <span class="mfu-evidence-conf-label">CONFIDENCE</span>
                <span class="mfu-evidence-conf-value">{{ record.confidence }}%</span>
              </div>
              <div class="mfu-evidence-alert">
                <span class="mfu-evidence-alert-label">ALERT TYPE</span>
                <span class="mfu-evidence-alert-value">{{ record.alertType }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Audit History -->
        <div v-if="isAdmin" class="mfu-audit-card mt-4">
          <div class="mfu-audit-title">AUDIT HISTORY</div>
          <div class="mfu-timeline">
            <div v-for="(event, idx) in auditHistory" :key="idx" class="mfu-timeline-item">
              <div :class="['mfu-timeline-dot', event.dotClass]">
                <svg v-if="event.icon === 'check'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else-if="event.icon === 'alert'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/></svg>
              </div>
              <div class="mfu-timeline-content">
                <div class="mfu-timeline-event-title">{{ event.title }}</div>
                <div class="mfu-timeline-event-time">{{ event.time }}</div>
                <div class="mfu-timeline-event-desc">{{ event.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </CCol>

      <!-- Right: Metadata & Actions -->
      <CCol lg="5" class="mb-4">
        <!-- Event Metadata -->
        <div class="mfu-meta-card">
          <div class="mfu-meta-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            EVENT METADATA
          </div>
          <div class="mfu-meta-rows">
            <div class="mfu-meta-row">
              <span class="mfu-meta-label">Timestamp</span>
              <span class="mfu-meta-value mfu-meta-value--mono">{{ record.timestamp }}</span>
            </div>
            <div class="mfu-meta-row">
              <span class="mfu-meta-label">Location</span>
              <span class="mfu-meta-value">{{ record.location }}</span>
            </div>
            <div class="mfu-meta-row">
              <span class="mfu-meta-label">Camera IM</span>
              <span class="mfu-meta-value mfu-meta-value--mono">{{ record.cameraId }}</span>
            </div>
            <div class="mfu-meta-row">
              <span class="mfu-meta-label">Protocol</span>
              <span class="mfu-meta-value">{{ record.protocol }}</span>
            </div>
          </div>
        </div>

        <!-- Extracted Intel -->
        <div class="mfu-intel-card mt-4">
          <div class="mfu-intel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            EXTRACTED INTEL
          </div>
          <div class="mfu-intel-grid">
            <div class="mfu-intel-item">
              <span class="mfu-intel-label">PLATE NUMBER</span>
              <span class="mfu-intel-value">{{ record.plateNumber }}</span>
            </div>
            <div class="mfu-intel-item">
              <span class="mfu-intel-label">VEHICLE TYPE</span>
              <span class="mfu-intel-value">{{ record.vehicleType }}</span>
            </div>
          </div>
        </div>

        <!-- Reviewer Action Panel -->
        <div v-if="isAdmin" class="mfu-reviewer-card mt-4">
          <div class="mfu-reviewer-title">REVIEWER ACTION PANEL</div>
          <div class="mfu-reviewer-body">
            <label class="mfu-reviewer-label">INTERNAL NOTES</label>
            <textarea
              class="mfu-reviewer-textarea"
              placeholder="Add observations, citation numbers or verification details..."
              v-model="internalNotes"
              rows="4"
            ></textarea>

            <div class="mfu-reviewer-row mt-3">
              <div class="mfu-reviewer-col">
                <label class="mfu-reviewer-label">FLAG CATEGORY</label>
                <div class="mfu-flag-tags">
                  <span v-for="tag in flagCategories" :key="tag" class="mfu-flag-tag">{{ tag }}</span>
                </div>
              </div>
              <div class="mfu-reviewer-col">
                <label class="mfu-reviewer-label">ASSIGN REVIEWER</label>
                <div class="mfu-reviewer-assign">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>{{ assignedReviewer }}</span>
                </div>
              </div>
            </div>

            <div class="mfu-reviewer-actions mt-4">
              <button class="mfu-action-btn mfu-action-btn--outline-secondary" style="flex:1;">Discard Changes</button>
              <button class="mfu-action-btn mfu-action-btn--dark" style="flex:1;" @click="saveNote">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Internal Note
              </button>
            </div>
          </div>
        </div>
      </CCol>
    </CRow>

    <!-- Footer -->
    <div class="mfu-detail-footer">
      <div class="mfu-footer-left">&copy; 2023 Mae Fah Luang University - Security Intelligence Systems (Max Vision)</div>
      <div class="mfu-footer-right">
        <span>Privacy Policy</span>
        <span>System Health: Normal</span>
        <span>v2.4.1-stable</span>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/service/api'
import securityAccess from '@/projects/mixins/securityAccess'

export default {
  name: 'RecordDetail',
  mixins: [securityAccess],
  data() {
    return {
      record: {
        timestamp: '',
        location: '',
        cameraId: '',
        protocol: 'Visual AI - P2',
        confidence: '0',
        alertType: '',
        plateNumber: '',
        vehicleType: 'Motorcycle',
        status: 'pending'
      },
      internalNotes: '',
      flagCategories: ['TRAFFIC', 'SAFETY', 'URGENT'],
      assignedReviewer: 'Security Team A',
      auditHistory: [],
      loading: false
    }
  },
  computed: {
    isAdmin() {
      const profile = this.$store.getters['auth/profile']
      const role = profile?.role || (profile?.userinfo && profile.userinfo.role) || ''
      return role === 'admin' || this.canViewPath('/newsystem/registry')
    },
    recordId() {
      return this.$route.params.id || '0000'
    },
    statusLabel() {
      var map = { pending: 'PENDING REVIEW', approved: 'APPROVED', rejected: 'REJECTED' }
      return map[this.record.status] || 'PENDING REVIEW'
    },
    statusBadgeClass() {
      var map = { approved: 'mfu-status-badge--approved', rejected: 'mfu-status-badge--rejected' }
      return map[this.record.status] || 'mfu-status-badge--pending'
    },
    statusDotStyle() {
      var map = { pending: '#d97706', approved: '#16a34a', rejected: '#dc2626' }
      return { background: map[this.record.status] || '#d97706' }
    }
  },
  mounted() {
    this.fetchRecord()
  },
  methods: {
    async fetchRecord() {
      this.loading = true
      try {
        var res = await api.mfuVision('record', { id: this.recordId })
        if (res && res.data && res.data.data) {
          var r = res.data.data
          this.record = {
            timestamp: this.formatDate(r.timestamp),
            location: r.location || '',
            cameraId: r.camera_id || '',
            protocol: 'Visual AI - P2',
            confidence: r.confidence ? (r.confidence * 100).toFixed(1) : '0',
            alertType: this.formatType(r.violation_type),
            plateNumber: r.plate_number || 'N/A',
            vehicleType: 'Motorcycle',
            status: r.status || 'pending',
            image_url: r.image_url || ''
          }
          this.internalNotes = r.review_note || ''
          this.assignedReviewer = r.reviewer || 'Security Team A'

          // Build audit history from record data
          this.auditHistory = [
            {
              icon: 'check',
              dotClass: 'mfu-dot--green',
              title: 'Detection Initiated',
              time: this.formatDate(r.timestamp),
              description: 'System ' + (r.camera_id || 'CAM') + ' identified a violation \'' + this.formatType(r.violation_type) + '\' with ' + this.record.confidence + '% confidence.'
            },
            {
              icon: 'alert',
              dotClass: 'mfu-dot--red',
              title: 'Alert Generated',
              time: this.formatDate(r.timestamp),
              description: 'Real-time alert dispatched to security personnel at ' + (r.location || 'Gate') + '.'
            },
            {
              icon: 'default',
              dotClass: 'mfu-dot--blue',
              title: r.status === 'approved' ? 'Record Approved' : r.status === 'rejected' ? 'Record Rejected' : 'Record Queued for Review',
              time: this.formatDate(r.updated_at || r.timestamp),
              description: r.review_note || ''
            }
          ]
        }
      } catch (err) {
        // API not available - use mock data
        this.applyMockData()
      }
      this.loading = false
    },
    applyMockData() {
      this.record = {
        timestamp: '2023-11-24 14:32:01',
        location: 'Post guard gate',
        cameraId: 'CAM-01-IN',
        protocol: 'Visual AI - P2',
        confidence: '98.4',
        alertType: 'No Helmet',
        plateNumber: 'ABD-123',
        vehicleType: 'Motorcycle',
        status: 'pending'
      }
      this.auditHistory = [
        { icon: 'check', dotClass: 'mfu-dot--green', title: 'Detection Initiated', time: '2023-11-24 14:32:01', description: 'System CAM01-G04 identified a violation \'No Helmet\' with high confidence.' },
        { icon: 'alert', dotClass: 'mfu-dot--red', title: 'Alert Generated', time: '2023-11-24 14:32:05', description: 'Real-time alert dispatched to security personnel at Gate 01.' },
        { icon: 'default', dotClass: 'mfu-dot--blue', title: 'Record Queued for Review', time: '2023-11-24 14:33:10', description: '' }
      ]
    },
    async approveRecord() {
      try {
        await api.mfuVision('update', { id: this.recordId, _id: this.recordId, status: 'approved', reviewer: this.assignedReviewer, review_note: this.internalNotes })
        this.record.status = 'approved'
        this.fetchRecord()
      } catch (err) {
        alert('Failed to approve record')
      }
    },
    async rejectRecord() {
      try {
        await api.mfuVision('update', { id: this.recordId, _id: this.recordId, status: 'rejected', reviewer: this.assignedReviewer, review_note: this.internalNotes })
        this.record.status = 'rejected'
        this.fetchRecord()
      } catch (err) {
        alert('Failed to reject record')
      }
    },
    async saveNote() {
      try {
        await api.mfuVision('update', { id: this.recordId, _id: this.recordId, review_note: this.internalNotes, reviewer: this.assignedReviewer })
        alert('Note saved successfully')
      } catch (err) {
        alert('Failed to save note')
      }
    },
    formatDate(d) {
      if (!d) return ''
      var dt = new Date(d)
      return dt.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    },
    formatType(type) {
      var map = { no_helmet: 'No Helmet', unauthorized_entry: 'Unauthorized Entry', speeding: 'Speeding', other: 'Other' }
      return map[type] || type || 'Unknown'
    }
  }
}
</script>

<style scoped>
.mfu-page {
  padding: 0.5rem;
}

/* Breadcrumb */
.mfu-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.mfu-breadcrumb-link {
  color: #64748b;
  text-decoration: none;
}
.mfu-breadcrumb-link:hover {
  color: #0f172a;
}
.mfu-breadcrumb-sep {
  color: #cbd5e1;
}
.mfu-breadcrumb-current {
  color: #991b1b;
}

/* Detail Header */
.mfu-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}
.mfu-detail-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.mfu-detail-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.mfu-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.mfu-status-badge--pending {
  background: #fef3c7;
  color: #92400e;
}
.mfu-status-dot {
  width: 6px;
  height: 6px;
  background: #d97706;
  border-radius: 50%;
}
.mfu-detail-header-right {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Action Buttons */
.mfu-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}
.mfu-action-btn--ghost {
  background: transparent;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.mfu-action-btn--ghost:hover { background: #f8fafc; }
.mfu-action-btn--outline-danger {
  background: #ffffff;
  color: #dc2626;
  border: 1px solid #fca5a5;
}
.mfu-action-btn--outline-danger:hover { background: #fef2f2; }
.mfu-action-btn--primary {
  background: #991b1b;
  color: #ffffff;
}
.mfu-action-btn--primary:hover { background: #7f1d1d; }
.mfu-action-btn--outline-secondary {
  background: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.mfu-action-btn--outline-secondary:hover { background: #f8fafc; }
.mfu-action-btn--dark {
  background: #0f172a;
  color: #ffffff;
}
.mfu-action-btn--dark:hover { background: #1e293b; }

/* Evidence Card */
.mfu-evidence-card {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}
.mfu-evidence-image-wrap {
  position: relative;
}
.mfu-evidence-overlay-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 1rem;
  background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%);
  color: #d1d5db;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05em;
  z-index: 1;
}
.mfu-evidence-image {
  width: 100%;
  height: auto;
  display: block;
  min-height: 300px;
  object-fit: cover;
}
.mfu-evidence-overlay-bottom {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  z-index: 1;
}
.mfu-evidence-confidence {
  background: #991b1b;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mfu-evidence-conf-label {
  font-size: 0.6rem;
  color: #fca5a5;
  letter-spacing: 0.1em;
  font-weight: 600;
}
.mfu-evidence-conf-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}
.mfu-evidence-alert {
  background: #7f1d1d;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mfu-evidence-alert-label {
  font-size: 0.6rem;
  color: #fca5a5;
  letter-spacing: 0.1em;
  font-weight: 600;
}
.mfu-evidence-alert-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
}

/* Audit Card */
.mfu-audit-card {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  padding: 1.5rem;
}
.mfu-audit-title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

/* Timeline */
.mfu-timeline {
  position: relative;
  padding-left: 2rem;
}
.mfu-timeline::before {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}
.mfu-timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
}
.mfu-timeline-item:last-child {
  margin-bottom: 0;
}
.mfu-timeline-dot {
  position: absolute;
  left: -2rem;
  top: 0.15rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(3px);
}
.mfu-dot--green { background: #d1fae5; color: #166534; }
.mfu-dot--red { background: #fee2e2; color: #991b1b; }
.mfu-dot--blue { background: #dbeafe; color: #1e40af; }
.mfu-timeline-event-title {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.9rem;
}
.mfu-timeline-event-time {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}
.mfu-timeline-event-desc {
  font-size: 0.85rem;
  color: #64748b;
  padding-left: 0.5rem;
  border-left: 2px solid #f1f5f9;
}

/* Meta Card */
.mfu-meta-card {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  padding: 1.5rem;
}
.mfu-meta-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 1.25rem;
}
.mfu-meta-rows {
  display: flex;
  flex-direction: column;
}
.mfu-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8fafc;
}
.mfu-meta-row:last-child { border-bottom: none; }
.mfu-meta-label {
  color: #64748b;
  font-size: 0.85rem;
}
.mfu-meta-value {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.85rem;
}
.mfu-meta-value--mono {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.03em;
}

/* Intel Card */
.mfu-intel-card {
  background: #1e293b;
  border-radius: 1rem;
  padding: 1.5rem;
}
.mfu-intel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 1.25rem;
}
.mfu-intel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.mfu-intel-item {
  background: #0f172a;
  border-radius: 0.75rem;
  padding: 1rem;
}
.mfu-intel-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #64748b;
  margin-bottom: 0.5rem;
}
.mfu-intel-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
}

/* Reviewer Card */
.mfu-reviewer-card {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}
.mfu-reviewer-title {
  padding: 1rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 1px solid #f1f5f9;
}
.mfu-reviewer-body {
  padding: 1.5rem;
}
.mfu-reviewer-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #475569;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}
.mfu-reviewer-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: #0f172a;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
}
.mfu-reviewer-textarea:focus {
  border-color: #991b1b;
  box-shadow: 0 0 0 3px rgba(153, 27, 27, 0.08);
}
.mfu-reviewer-textarea::placeholder {
  color: #94a3b8;
}
.mfu-reviewer-row {
  display: flex;
  gap: 1rem;
}
.mfu-reviewer-col {
  flex: 1;
}
.mfu-flag-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.mfu-flag-tag {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.03em;
}
.mfu-flag-tag:last-child {
  background: #fef3c7;
  border-color: #fcd34d;
  color: #92400e;
}
.mfu-reviewer-assign {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  color: #475569;
}
.mfu-reviewer-actions {
  display: flex;
  gap: 0.75rem;
}

/* Footer */
.mfu-detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0 1rem;
  border-top: 1px solid #f1f5f9;
  margin-top: 2rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.mfu-footer-left {
  font-size: 0.75rem;
  color: #94a3b8;
}
.mfu-footer-right {
  display: flex;
  gap: 1.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
}
</style>
