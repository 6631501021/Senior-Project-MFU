import api from '@/service/api'

const state = {
  records: [],
  currentRecord: null,
  stats: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null
}

const getters = {
  records: (state) => state.records,
  currentRecord: (state) => state.currentRecord,
  stats: (state) => state.stats,
  pagination: (state) => state.pagination,
  loading: (state) => state.loading,
  error: (state) => state.error
}

const mutations = {
  SET_RECORDS (state, payload) {
    state.records = payload.records || []
    if (payload.pagination) {
      state.pagination = payload.pagination
    }
  },
  SET_CURRENT_RECORD (state, record) {
    state.currentRecord = record
  },
  SET_STATS (state, stats) {
    state.stats = stats
  },
  SET_LOADING (state, loading) {
    state.loading = !!loading
  },
  SET_ERROR (state, error) {
    state.error = error
  },
  RESET (state) {
    state.records = []
    state.currentRecord = null
    state.stats = null
    state.pagination = { page: 1, limit: 20, total: 0, pages: 0 }
    state.loading = false
    state.error = null
  }
}

const actions = {
  async fetchRecords ({ commit }, params) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const response = await api.mfuVision('records', params || {})
      const data = response && response.data && response.data.data ? response.data.data : {}
      commit('SET_RECORDS', {
        records: data.records || [],
        pagination: data.pagination || {}
      })
      return data
    } catch (error) {
      commit('SET_ERROR', error && error.message ? error.message : 'Failed to fetch records')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchRecord ({ commit }, params) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const response = await api.mfuVision('record', params || {})
      const record = response && response.data && response.data.data ? response.data.data : null
      commit('SET_CURRENT_RECORD', record)
      return record
    } catch (error) {
      commit('SET_ERROR', error && error.message ? error.message : 'Failed to fetch record')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchStats ({ commit }) {
    try {
      const response = await api.mfuVision('stats')
      const stats = response && response.data && response.data.data ? response.data.data : null
      commit('SET_STATS', stats)
      return stats
    } catch (error) {
      commit('SET_ERROR', error && error.message ? error.message : 'Failed to fetch stats')
      throw error
    }
  },

  async updateRecord ({ commit }, params) {
    try {
      const response = await api.mfuVision('update', params || {})
      const record = response && response.data && response.data.data ? response.data.data : null
      commit('SET_CURRENT_RECORD', record)
      return record
    } catch (error) {
      commit('SET_ERROR', error && error.message ? error.message : 'Failed to update record')
      throw error
    }
  },

  async seedDemo ({ dispatch }) {
    const response = await api.mfuVision('seed-demo')
    await dispatch('fetchRecords')
    await dispatch('fetchStats')
    return response && response.data && response.data.data ? response.data.data : null
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
