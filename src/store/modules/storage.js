const state = {
    data: {}
}

const mutations = {
    SET_DATA (state, data) {
        state.data = data
    }
}

const actions = {
    setPutInData ({commit}, data) {
        commit('SET_DATA', data)
    }
}


export default {
    state,
    mutations,
    actions
}