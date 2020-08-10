import axios from 'axios'

const instance = axios.create()

instance.interceptors.request.use((config) => {
  return config
}, (error) => {
  return Promise.reject(error)
})

instance.interceptors.response.use((response) => {
  return Promise.resolve(response)
}, (err) => {
  return Promise.reject(err)
})

export default instance
