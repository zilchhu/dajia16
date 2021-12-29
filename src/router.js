// import App2 from './App2.vue'
import NotFound from './NotFound'
import User from "./pages/user/User"
import UserActsOvTable from "./pages/user/UserActsOvTable"
import UserRecords from "./pages/user/UserRecords"
import Shop from "./pages/shop/Shop"
import FreshShop from "./pages/shop/FreshShop"
import Change from "./pages/change/Change"
import Tasks from "./pages/change/Tasks"
import Prob from "./pages/probs/Prob"
import Tools from "./pages/tools/Tools"
import ToolsFood from "./pages/tools/ToolsFood"
import ToolsAddFresh from "./pages/tools/ToolsAddFresh"
import ToolsAddFengniao from "./pages/tools/ToolsAddFengniao"
import ToolsAddDada from "./pages/tools/ToolsAddDada"
import ToolsAddShunfeng from "./pages/tools/ToolsAddShunfeng"
import ToolsAddMyt from "./pages/tools/ToolsAddMyt"
import ToolsAddSss from "./pages/tools/ToolsAddSss"
import ToolsAddZps from "./pages/tools/ToolsAddZps"
import ToolsFreshMt from "./pages/tools/ToolsFreshMt"
import ToolsFreshElm from "./pages/tools/ToolsFreshElm"
import ToolsTests from "./pages/tools/ToolsTests"
// import ToolsFoodMt from "./pages/tools/ToolsFoodMt"
// import ToolsFoodElm from "./pages/tools/ToolsFoodElm"
import ToolsFoodSubMt from "./pages/tools/ToolsFoodSubMt"
import ToolsDelivery from "./pages/tools/ToolsDelivery"
import ToolsFullDiscount from "./pages/tools/ToolsFullDiscount"
import ToolsOrderCoupon from "./pages/tools/ToolsOrderCoupon"
import ToolsSealFullDiscountCoupon from "./pages/tools/ToolsSealFullDiscountCoupon"
import ToolsPoiInnerCoupon from "./pages/tools/ToolsPoiInnerCoupon"
import ToolsCollectCoupon from "./pages/tools/ToolsCollectCoupon"
import ToolsPicMt from "./pages/tools/ToolsPicMt"
import ToolsPicElm from "./pages/tools/ToolsPicElm"
// import ToolsWhiteList from './pages/tools/ToolsWhiteList'
import ToolsWhiteListRedirect from "./pages/tools/ToolsWhiteListRedirect"
import Date from "./pages/date/Date"
import Sum from "./pages/date/Sum"
import Sum2 from "./pages/date/Sum2"
import Perf from "./pages/date/Perf"
import Perf2 from "./pages/date/Perf2"
import Note from "./pages/notes/Note"
import ActivityComments from "./components/user/ActivityComments"
import { createWebHistory, createRouter } from "vue-router"

export const routes = [
  { path: "/shop/:shopid(\\d+)", name: "shop", component: Shop },
  { path: "/user/:username/:date(\\d+)", name: "user", component: User },
  { path: "/user/:username/acts", name: "user-acts", component: UserActsOvTable },
  { path: "/changes", name: "changes", component: Change },
  { path: "/tasks", name: "tasks", component: Tasks },
  { path: "/probs", name: "probs", component: Prob },
  {
    path: "/tools",
    component: Tools,
    name: "tools",
    // children: [

    // ]
  },
  { path: "/tools/food", name: "tools-food", component: ToolsFood },
  { path: "/tools/add/fresh", name: "tools-add-fresh", component: ToolsAddFresh },
  { path: "/tools/add/fengniao", name: "tools-add-fengniao", component: ToolsAddFengniao },
  { path: "/tools/add/dada", name: "tools-add-dada", component: ToolsAddDada },
  { path: "/tools/add/shunfeng", name: "tools-add-shunfeng", component: ToolsAddShunfeng },
  { path: "/tools/add/myt", name: "tools-add-myt", component: ToolsAddMyt },
  { path: "/tools/add/sss", name: "tools-add-sss", component: ToolsAddSss },
  { path: "/tools/add/zps", name: "tools-add-zps", component: ToolsAddZps },
  { path: "/tools/fresh/mt", name: "tools-fresh-mt", component: ToolsFreshMt },
  { path: "/tools/fresh/elm", name: "tools-fresh-elm", component: ToolsFreshElm },
  // { path: "/tools/food/mt", name: "tools-food-mt", component: ToolsFoodMt },
  // { path: "/tools/food/elm", name: "tools-food-elm", component: ToolsFoodElm },
  { path: "/tools/food/sub/mt", name: "tools-food-sub-mt", component: ToolsFoodSubMt },
  { path: "/tools/delivery", name: "tools-delivery", component: ToolsDelivery },
  { path: "/tools/fulldiscount", name: "tools-full-discount", component: ToolsFullDiscount },
  { path: "/tools/ordercoupon", name: "tools-order-coupon", component: ToolsOrderCoupon },
  { path: "/tools/sealfullcoupon", name: "tools-seal-full-discount-coupon", component: ToolsSealFullDiscountCoupon },
  { path: "/tools/poiinnercoupon", name: "tools-poi-inner-coupon", component: ToolsPoiInnerCoupon },
  { path: "/tools/collectcoupon", name: "tools-collect-coupon", component: ToolsCollectCoupon },
  { path: "/tools/pic/mt", name: "tools-pic-mt", component: ToolsPicMt },
  { path: "/tools/pic/elm", name: "tools-pic-elm", component: ToolsPicElm },
  { path: "/tools/whitelist", name: "tools-white-list", component: ToolsWhiteListRedirect },
  { path: "/tools/tests", name: "tools-tests", component: ToolsTests },
  { path: "/date/:day", name: "date", component: Date },
  { path: "/sum/:day", name: "sum", component: Sum },
  { path: "/sum2", name: "sum2", component: Sum2 },
  { path: "/perf/:day", name: "perf", component: Perf },
  { path: "/perf2", name: "perf2", component: Perf2 },
  { path: "/records", name: "records", component: UserRecords },
  { path: "/freshshop", name: "fresh-shop", component: FreshShop },
  { path: "/testc", name: "activity-comments", component: ActivityComments },
  { path: "/notes", name: "note", component: Note },
  { path: "/", name: "index", redirect: "/date/1" },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
