<template>
  <div class="mfu-page">
    <div class="mfu-page-header d-flex flex-wrap justify-content-between align-items-start mb-4">
      <div>
        <div class="mfu-page-badge">MFU Vision</div>
        <h1 class="mfu-page-title">Helmet Detection Dashboard</h1>
        <p class="mfu-page-subtitle">ติดตามสถิติการปฏิบัติตามมาตรการสวมหมวกกันน็อกแบบเรียลไทม์สำหรับพื้นที่และทางเข้าต่าง ๆ</p>
      </div>
      <div class="mfu-page-actions mt-3 mt-md-0">
        <CButton color="danger" class="mr-2">Export</CButton>
        <CButton color="secondary" variant="outline">Refresh</CButton>
      </div>
    </div>

    <CRow class="mb-4">
      <CCol md="4" class="mb-3">
        <CCard class="mfu-summary-card h-100">
          <CCardBody>
            <div class="mfu-summary-label">Total Cameras</div>
            <div class="mfu-summary-value">24</div>
            <div class="mfu-summary-note">กล้องที่กำลังทำงาน</div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md="4" class="mb-3">
        <CCard class="mfu-summary-card h-100">
          <CCardBody>
            <div class="mfu-summary-label">Helmet Compliance</div>
            <div class="mfu-summary-value">92%</div>
            <div class="mfu-summary-note">จุดตรวจทั้งหมด</div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md="4" class="mb-3">
        <CCard class="mfu-summary-card h-100">
          <CCardBody>
            <div class="mfu-summary-label">Recent Violations</div>
            <div class="mfu-summary-value">186</div>
            <div class="mfu-summary-note">24 ชั่วโมงที่ผ่านมา</div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow class="mb-4">
      <CCol lg="7" class="mb-3">
        <CCard class="mfu-module-card h-100">
          <CCardHeader class="mfu-module-card-header">Live Detection Modules</CCardHeader>
          <CCardBody>
            <div class="mfu-module-grid">
              <div class="mfu-module-block">
                <div class="mfu-module-title">Helmet Detection</div>
                <div class="mfu-module-meta">CAM_01</div>
                <div class="mfu-module-status success">Live</div>
              </div>
              <div class="mfu-module-block">
                <div class="mfu-module-title">Entrance Monitoring</div>
                <div class="mfu-module-meta">CAM_02</div>
                <div class="mfu-module-status success">Live</div>
              </div>
              <div class="mfu-module-block">
                <div class="mfu-module-title">No-Helmet Alert</div>
                <div class="mfu-module-meta">CAM_03</div>
                <div class="mfu-module-status warning">Warning</div>
              </div>
              <div class="mfu-module-block">
                <div class="mfu-module-title">Unauthorized Entry</div>
                <div class="mfu-module-meta">CAM_04</div>
                <div class="mfu-module-status danger">Critical</div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol lg="5" class="mb-3">
        <CCard class="mfu-chart-card h-100">
          <CCardHeader class="mfu-module-card-header">Violation Trend</CCardHeader>
          <CCardBody>
            <div class="mfu-chart-placeholder">
              <span>Dashboard chart placeholder</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow>
      <CCol lg="4" class="mb-3">
        <CCard class="mfu-info-card">
          <CCardBody>
            <div class="mfu-info-label">Current Focus</div>
            <div class="mfu-info-value">Helmet Compliance and gate access</div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol lg="4" class="mb-3">
        <CCard class="mfu-info-card">
          <CCardBody>
            <div class="mfu-info-label">Action</div>
            <div class="mfu-info-value">เพิ่มกล้องและแก้ไขการแจ้งเตือน</div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol lg="4" class="mb-3">
        <CCard class="mfu-info-card">
          <CCardBody>
            <div class="mfu-info-label">Next Review</div>
            <div class="mfu-info-value">09:00 AM พรุ่งนี้</div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
export default {
  name: 'MFUVision'
}
</script>

<style scoped>
.mfu-page {
  padding: 0.5rem;
}
.mfu-page-header {
  width: 100%;
}
.mfu-page-badge {
  display: inline-block;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #9f1239;
}
.mfu-page-title {
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: 700;
}
.mfu-page-subtitle {
  margin-bottom: 1rem;
  color: #475569;
}
.mfu-page-actions .btn {
  min-width: 110px;
}
.mfu-summary-card,
.mfu-module-card,
.mfu-chart-card,
.mfu-info-card {
  border: 0;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}
.mfu-summary-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  font-weight: 700;
}
.mfu-summary-value {
  margin-top: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
}
.mfu-summary-note {
  margin-top: 0.5rem;
  color: #475569;
}
.mfu-module-card-header {
  background: transparent;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
}
.mfu-module-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.mfu-module-block {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 1rem;
}
.mfu-module-title {
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.mfu-module-meta {
  color: #475569;
  margin-bottom: 0.75rem;
}
.mfu-module-status {
  display: inline-flex;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}
.mfu-module-status.success {
  background: #d1fae5;
  color: #166534;
}
.mfu-module-status.warning {
  background: #fef3c7;
  color: #92400e;
}
.mfu-module-status.danger {
  background: #fee2e2;
  color: #991b1b;
}
.mfu-chart-placeholder {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 1rem;
}
.mfu-info-label {
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 700;
}
.mfu-info-value {
  margin-top: 0.75rem;
  font-weight: 700;
  color: #0f172a;
}
</style>
