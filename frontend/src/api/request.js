import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器 - 自动附加 JWT token
request.interceptors.request.use(
  (config) => {
    const saved = localStorage.getItem('conlaboro_auth')
    if (saved) {
      try {
        const { currentUser } = JSON.parse(saved)
        if (currentUser?.token) {
          config.headers.Authorization = `Bearer ${currentUser.token}`
        }
      } catch {}
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 统一错误处理
request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      // 业务错误
      if ([401, 1003].includes(res.code)) {
        localStorage.removeItem('conlaboro_auth')
        window.location.href = '/login'
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data  // 返回 data 字段，去掉 code/message 包装
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('conlaboro_auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default request
