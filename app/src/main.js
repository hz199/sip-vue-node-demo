import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUi from './components/element'

Vue.config.productionTip = false
Vue.use(ElementUi)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
