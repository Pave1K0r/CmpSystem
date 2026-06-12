import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// 用户模块 token setToken removeToken
export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const user = ref({})

    const username = computed(() => user.value?.username)
    const role = computed(() => user.value?.role)
    const setToken = (newToken) => {
      token.value = newToken
    }
    const setUser = (newUser) => {
      user.value = newUser
    }
    const clear = () => {
      token.value = ''
      user.value = {}
    }
    return {
      token,
      username,
      user,
      role,
      setToken,
      setUser,
      logout: clear,
      removeToken: clear,
    }
  },
  {
    persist: true,
  },
)
