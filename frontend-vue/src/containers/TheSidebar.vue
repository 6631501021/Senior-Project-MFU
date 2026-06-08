<template>
  <CSidebar
      class="mfu-sidebar"
      :minimize="minimize"
      unfoldable
      :show="show"
      @update:show="(value) => $store.commit('set', ['sidebarShow', value])"
  >
    <CSidebarBrand class="d-md-down-none mfu-sidebar-brand">
      <div class="c-sidebar-brand-full">
        <a href="/" class="mfu-brand-link">
          <div class="mfu-brand-icon">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="8" fill="#991B1B"/>
              <path d="M18 8C13.6 8 10 11.6 10 16C10 18.4 11 20.5 12.7 21.9L12 27H24L23.3 21.9C25 20.5 26 18.4 26 16C26 11.6 22.4 8 18 8ZM18 11C20.8 11 23 13.2 23 16C23 18.8 20.8 21 18 21C15.2 21 13 18.8 13 16C13 13.2 15.2 11 18 11Z" fill="white"/>
            </svg>
          </div>
          <div class="mfu-brand-text">
            <span class="mfu-brand-name">Helmet Detection</span>
            <span class="mfu-brand-sub">SECURITY INTELLIGENCE</span>
          </div>
        </a>
      </div>
      <CIcon
          class="c-sidebar-brand-minimized"
          name="logo"
          size="custom-size"
          :height="35"
          viewBox="0 0 110 134"
      />
    </CSidebarBrand>
    <CRenderFunction flat :contentToRender="navs"/>
    <div class="mfu-sidebar-footer">
      <a href="#" class="mfu-logout-link" @click.prevent="onLogout">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span class="mfu-logout-text">Logout</span>
      </a>
    </div>
    <CSidebarMinimizer
        class="c-d-md-down-none"
        @click.native="$store.commit('toggle', 'sidebarMinimize')"
    />
  </CSidebar>
</template>

<script>
import buildNav from './_nav'

export default {
  name: 'TheSidebar',
  computed: {
    permissionLoaded() {
      return this.$store.getters['security/loaded']
    },
    navs() {
      this.$i18n.locale
      const navConfig = buildNav(this.$t.bind(this))
      return this.filterNavTree(navConfig)
    },
    show() {
      return this.$store.state.sidebarShow
    },
    minimize() {
      return this.$store.state.sidebarMinimize
    },
    isLocalAdmin() {
      const profile = this.$store.getters['auth/profile']
      return !!(profile && (profile.role === 'admin' || (profile.userinfo && profile.userinfo.role === 'admin')))
    }
  },
  watch: {
    '$store.state.XAccessToken': {
      async handler(value) {
        if (!value) return
        if (this.permissionLoaded) return
        try {
          await this.$store.dispatch('security/fetchMyPermissions')
        } catch (error) {
          // Keep sidebar visible if permission bootstrap fails.
        }
      },
      immediate: true
    }
  },
  methods: {
    onLogout() {
      this.$store.dispatch('auth/signOut')
    },
    normalizePermissionPath(path) {
      if (!path) return ''
      let normalized = String(path).trim()
      const queryIndex = normalized.indexOf('?')
      if (queryIndex !== -1) normalized = normalized.slice(0, queryIndex)
      const hashIndex = normalized.indexOf('#')
      if (hashIndex !== -1) normalized = normalized.slice(0, hashIndex)
      normalized = normalized.replace(/\/{2,}/g, '/')
      if (!normalized.startsWith('/')) normalized = `/${normalized}`
      if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1)
      }
      return normalized
    },
    swapPermissionPlurality(path) {
      const normalized = this.normalizePermissionPath(path)
      if (!normalized) return ''
      if (normalized.includes('/permissions')) return normalized.replace('/permissions', '/permission')
      if (normalized.includes('/permission')) return normalized.replace('/permission', '/permissions')
      return ''
    },
    hasViewPermission(item) {
      if (!item) return true
      const path = this.normalizePermissionPath(item.to || item.route || '')
      const isGeneralMenu = path === '/dashboard' || path === '/mfu/realtime' || path === '/mfu/records'
      if (isGeneralMenu && this.isLocalAdmin) {
        return true
      }

      const requiresExplicitPermission = !!(item.permission && item.permission.path)
      if (!this.permissionLoaded) {
        return requiresExplicitPermission ? !this.$store.state.XAccessToken : true
      }
      const matrix = this.$store.getters['security/matrix'] || {}
      const isAdmin = !!(matrix['/newsystem/registry'] && (matrix['/newsystem/registry'].view || matrix['/newsystem/registry'].all))

      if (!isAdmin) {
        // Non-admin users should only see Dashboard and Records (Your Violation)
        if (path !== '/dashboard' && path !== '/mfu/records') {
          return false
        }
      }

      const permissionPath = item.permission && item.permission.path
        ? item.permission.path
        : (item.to || item.route || '')
      const normalizedRoute = this.normalizePermissionPath(permissionPath)
      const rule = matrix[normalizedRoute] || matrix[this.swapPermissionPlurality(normalizedRoute)]

      if (!rule) return !requiresExplicitPermission
      const action = item.permission && item.permission.action ? item.permission.action : 'view'
      return !!(rule.all || rule[action] || rule.view)
    },
    filterNavTree(items) {
      if (!Array.isArray(items)) return []

      const filtered = items.reduce((result, item) => {
        if (!item || typeof item !== 'object') return result

        if (item._name === 'CSidebarNavTitle') {
          result.push({ ...item })
          return result
        }

        const nextItem = { ...item }
        const children = Array.isArray(item._children) ? this.filterNavTree(item._children) : null
        const dropdownItems = Array.isArray(item.items) ? this.filterNavTree(item.items) : null

        if (children) nextItem._children = children
        if (dropdownItems) nextItem.items = dropdownItems

        const hasVisibleChildren = !!((children && children.length) || (dropdownItems && dropdownItems.length))
        const isDropdown = item._name === 'CSidebarNavDropdown'
        const showItem = isDropdown ? hasVisibleChildren : (hasVisibleChildren || this.hasViewPermission(item))

        if (showItem) {
          result.push(nextItem)
        }

        return result
      }, [])

      return filtered.filter((item, index) => {
        if (item._name !== 'CSidebarNavTitle') return true
        const nextItem = filtered[index + 1]
        return !!nextItem && nextItem._name !== 'CSidebarNavTitle'
      })
    }
  }
}
</script>

<style>
.mfu-sidebar.c-sidebar {
  background: #ffffff !important;
  border-right: 1px solid #e2e8f0;
}

.mfu-sidebar .c-sidebar-nav-link,
.mfu-sidebar .c-sidebar-nav-dropdown-toggle {
  color: #334155 !important;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.75rem 1.25rem;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.mfu-sidebar .c-sidebar-nav-link:hover,
.mfu-sidebar .c-sidebar-nav-dropdown-toggle:hover {
  background: #fef2f2 !important;
  color: #991b1b !important;
}

.mfu-sidebar .c-sidebar-nav-link.c-active,
.mfu-sidebar .c-sidebar-nav-link.router-link-active {
  background: transparent !important;
  color: #dc2626 !important;
  font-weight: 600;
  border-left: 3px solid #dc2626;
}

.mfu-sidebar .c-sidebar-nav-icon {
  color: #64748b !important;
}

.mfu-sidebar .c-sidebar-nav-link.c-active .c-sidebar-nav-icon,
.mfu-sidebar .c-sidebar-nav-link.router-link-active .c-sidebar-nav-icon {
  color: #dc2626 !important;
}

.mfu-sidebar .c-sidebar-nav-title {
  color: #94a3b8 !important;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 1.5rem 1.25rem 0.5rem;
}

.mfu-sidebar .c-sidebar-nav-dropdown-items .c-sidebar-nav-link {
  padding-left: 3.25rem;
  font-size: 0.9rem;
}

.mfu-sidebar .c-sidebar-minimizer {
  background: #f8fafc !important;
  border-top: 1px solid #e2e8f0;
}

.mfu-sidebar .c-sidebar-minimizer::before {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 11 14'%3E%3Cpath d='M9.148 2.352l-4.148 4.148 4.148 4.148q0.148 0.148 0.148 0.352t-0.148 0.352l-1.297 1.297q-0.148 0.148-0.352 0.148t-0.352-0.148l-5.797-5.797q-0.148-0.148-0.148-0.352t0.148-0.352l5.797-5.797q0.148-0.148 0.352-0.148t0.352 0.148l1.297 1.297q0.148 0.148 0.148 0.352t-0.148 0.352z' fill='%2364748b'/%3E%3C/svg%3E") !important;
}

.mfu-sidebar-brand.c-sidebar-brand {
  background: #ffffff !important;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.75rem 1rem;
}

.mfu-brand-link {
  display: flex;
  align-items: center;
  text-decoration: none !important;
  gap: 0.75rem;
}

.mfu-brand-icon {
  flex-shrink: 0;
}

.mfu-brand-text {
  display: flex;
  flex-direction: column;
}

.mfu-brand-name {
  font-size: 1rem;
  font-weight: 700;
  color: #991b1b;
  line-height: 1.2;
}

.mfu-brand-sub {
  font-size: 0.65rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.mfu-sidebar-footer {
  margin-top: auto;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e2e8f0;
}

.mfu-logout-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #475569;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.mfu-logout-link:hover {
  color: #991b1b;
  text-decoration: none;
}
</style>
