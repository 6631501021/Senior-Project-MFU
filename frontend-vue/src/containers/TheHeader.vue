<template>
  <CHeader with-subheader class="mfu-header">
    <CToggler
      in-header
      class="ml-3 d-lg-none"
      @click="$store.commit('toggleSidebarMobile')"
    />
    <CToggler
      in-header
      class="ml-3 d-md-down-none"
      @click="$store.commit('toggleSidebarDesktop')"
    />
    <CHeaderBrand class="mx-auto d-lg-none" to="/">
    </CHeaderBrand>
    <CHeaderNav class="d-none d-lg-flex mr-auto align-items-center">
      <div class="header-brand-title">MFU Vision</div>
    </CHeaderNav>
    <CHeaderNav class="d-none d-lg-flex align-items-center mfu-header-nav">
      <CHeaderNavItem class="px-2">
        <router-link to="/dashboard" class="mfu-header-link" active-class="mfu-header-link--active">Dashboard</router-link>
      </CHeaderNavItem>
      <CHeaderNavItem class="px-2">
        <router-link to="/mfu/realtime" class="mfu-header-link" active-class="mfu-header-link--active">Real-time Detection</router-link>
      </CHeaderNavItem>
      <CHeaderNavItem class="px-2">
        <router-link to="/mfu/records" class="mfu-header-link" active-class="mfu-header-link--active">Records</router-link>
      </CHeaderNavItem>
      <CHeaderNavItem class="px-2">
        <router-link to="/mfu/analytics" class="mfu-header-link" active-class="mfu-header-link--active">Analytics</router-link>
      </CHeaderNavItem>
    </CHeaderNav>
    <CHeaderNav>
      <TheHeaderDropdownNotif/>
      <CHeaderNavItem>
        <CButton size="sm" color="info" shape="pill" variant="outline" style="width: 35px; height:35px;" @click="onSwitchLang">
          {{lang.toUpperCase()}}
        </CButton>
      </CHeaderNavItem>

      <TheHeaderDropdownAccnt class="pr-3"/>
    </CHeaderNav>
  </CHeader>
</template>

<script>
import TheHeaderDropdownAccnt from './TheHeaderDropdownAccnt'
import TheHeaderDropdownNotif from './TheHeaderDropdownNotif'
import {mapGetters} from "vuex";

export default {
  name: 'TheHeader',
  components: {
    TheHeaderDropdownAccnt,
    TheHeaderDropdownNotif
  },

  methods: {
    onSwitchLang(){
      switch (this.lang) {
        case "th":
          this.$store.commit("setting/lang", "en")
          break;
        case "en":
          this.$store.commit("setting/lang", "th")
          break;
      }
    }
  },

  computed: {
    ...mapGetters({
      lang: "setting/lang",
    })
  },
}
</script>

<style scoped>
.mfu-header {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.header-brand-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #991b1b;
  letter-spacing: -0.01em;
}

.mfu-header-link {
  color: #475569;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.25rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.mfu-header-link:hover {
  color: #0f172a;
  text-decoration: none;
}

.mfu-header-link--active {
  color: #0f172a !important;
  font-weight: 600;
  border-bottom-color: #991b1b;
}
</style>
