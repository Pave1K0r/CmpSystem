import { defineStore } from 'pinia'
import { ref } from 'vue'

// 用户模块 token setToken removeToken
export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const username = ref('')
    const setToken = (newToken) => {
      token.value = newToken
    }
    const setUsername = (newUsername) => {
      username.value = newUsername
    }
    const removeToken = () => {
      token.value = ''
      username.value = ''
    }
    return {
      token,
      username,
      setToken,
      setUsername,
      removeToken,
    }
  },
  {
    persist: true,
  },
)
