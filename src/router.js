// import App2 from './App2.vue'
import User from './pages/user/User'
import UserActsOvTable from './pages/user/UserActsOvTable'
import Shop from './pages/shop/Shop'
import FreshShop from './pages/shop/FreshShop'
import Change from './pages/change/Change'
import Prob from './pages/probs/Prob'
import Tools from './pages/tools/Tools'
import ToolsAddFresh from './pages/tools/ToolsAddFresh'
import ToolsAddFengniao from './pages/tools/ToolsAddFengniao'
import ToolsAddDada from './pages/tools/ToolsAddDada'
import ToolsAddShunfeng from './pages/tools/ToolsAddShunfeng'
import ToolsAddMyt from './pages/tools/ToolsAddMyt'
import ToolsFreshMt from './pages/tools/ToolsFreshMt'
import ToolsFreshElm from './pages/tools/ToolsFreshElm'
import ToolsTests from './pages/tools/ToolsTests'
import ToolsFoodMt from './pages/tools/ToolsFoodMt'
import ToolsFoodElm from './pages/tools/ToolsFoodElm'
import ToolsPicMt from './pages/tools/ToolsPicMt'
import ToolsPicElm from './pages/tools/ToolsPicElm'
// import ToolsWhiteList from './pages/tools/ToolsWhiteList'
import ToolsWhiteListRedirect from './pages/tools/ToolsWhiteListRedirect'
import Date from './pages/date/Date'
import Sum from './pages/date/Sum'
import Sum2 from './pages/date/Sum2'
import Perf from './pages/date/Perf'
import Perf2 from './pages/date/Perf2'
import Note from './pages/notes/Note'
import ActivityComments from './components/user/ActivityComments'
import { createWebHistory, createRouter } from 'vue-router'

const routes = [
  { path: '/shop/:shopid(\\d+)', name: 'shop', component: Shop },
  { path: '/user/:username/:date(\\d+)', name: 'user', component: User },
  { path: '/user/:username/acts', name: 'user-acts', component: UserActsOvTable },
  { path: '/changes', name: 'changes', component: Change },
  { path: '/probs', name: 'probs', component: Prob },
  {
    path: '/tools',
    component: Tools,
    name: 'tools',
    children: [
      { path: 'add/fresh', name: 'tools-add-fresh', component: ToolsAddFresh },
      { path: 'add/fengniao', name: 'tools-add-fengniao', component: ToolsAddFengniao },
      { path: 'add/dada', name: 'tools-add-dada', component: ToolsAddDada },
      { path: 'add/shunfeng', name: 'tools-add-shunfeng', component: ToolsAddShunfeng },
      { path: 'add/myt', name: 'tools-add-myt', component: ToolsAddMyt },
      { path: 'fresh/mt', name: 'tools-fresh-mt', component: ToolsFreshMt },
      { path: 'fresh/elm', name: 'tools-fresh-elm', component: ToolsFreshElm },
      { path: 'food/mt', name: 'tools-food-mt', component: ToolsFoodMt },
      { path: 'food/elm', name: 'tools-food-elm', component: ToolsFoodElm },
      { path: 'pic/mt', name: 'tools-pic-mt', component: ToolsPicMt },
      { path: 'pic/elm', name: 'tools-pic-elm', component: ToolsPicElm },
      { path: 'whitelist', name: 'tools-white-list', component: ToolsWhiteListRedirect },
      { path: 'tests', name: 'tools-tests', component: ToolsTests }
    ]
  },
  {path: '/date/:day', name: 'date', component: Date},
  {path: '/sum/:day', name: 'sum', component: Sum},
  {path: '/sum2', name: 'sum2', component: Sum2},
  {path: '/perf/:day', name: 'perf', component: Perf},
  {path: '/perf2', name: 'perf2', component: Perf2},
  {path: '/freshshop', name: 'fresh-shop', component: FreshShop},
  {path: '/testc', name: 'activity-comments', component: ActivityComments},
  {path: '/notes', name: 'note', component: Note},
  { path: '/', name: 'index', redirect: '/date/1' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
