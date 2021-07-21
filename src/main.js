import { createApp } from 'vue'

import App from './App3.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

import store from './store'
import router from './router'
import './ws'

const app = createApp(App)
app.config.productionTip = false

app.use(Antd)
app.use(store)
app.use(router)

app.mount('#app')


