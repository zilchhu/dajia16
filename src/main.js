import { createApp } from "vue"

import App from "./App3.vue"
import Antd from "ant-design-vue"
import "ant-design-vue/dist/antd.css"
import '@surely-vue/table/dist/index.css'

import store from "./store"
import router from "./router"
import "./ws"

import ECharts from "vue-echarts"
import { use } from "echarts/core"

// import ECharts modules manually to reduce bundle size
import { CanvasRenderer } from "echarts/renderers"
import { LineChart } from "echarts/charts"
import { GridComponent, TooltipComponent, TitleComponent } from "echarts/components"

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, TitleComponent])

const app = createApp(App)
app.config.productionTip = false

app.use(Antd)
app.use(store)
app.use(router)

app.component("v-chart", ECharts)

app.mount("#app")
