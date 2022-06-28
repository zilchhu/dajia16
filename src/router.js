import { createWebHistory, createRouter, createWebHashHistory } from "vue-router"
// import App2 from './App2.vue'
import NotFound from "./NotFound"
import Date from "./pages/date/Date"
import User from "./pages/user/User"
import UserRecords from "./pages/user/UserRecords"
import Shop from "./pages/shop/Shop"
import FreshShop from "./pages/shop/FreshShop"
import Change from "./pages/change/Change"
// import Tasks from "./pages/change/Tasks"
import Prob from "./pages/probs/Prob"
import Prob2 from "./pages/probs/Prob2"
import Prob3 from "./pages/probs/Prob3"
import Prob4 from "./pages/probs/Prob4"
import Prob5 from "./pages/probs/Prob5"
import Prob6 from "./pages/probs/Prob6"
import Prob7 from "./pages/probs/Prob7"

import ToolsFood from "./pages/tools/ToolsFood"
import ToolsFoodDiff from "./pages/tools/ToolsFoodDiff"
// import ToolsAddFresh from "./pages/tools/ToolsAddFresh"
// import ToolsAddFengniao from "./pages/tools/ToolsAddFengniao"
// import ToolsAddDada from "./pages/tools/ToolsAddDada"
// import ToolsAddShunfeng from "./pages/tools/ToolsAddShunfeng"
// import ToolsAddMyt from "./pages/tools/ToolsAddMyt"
import ToolsFreshMt from "./pages/tools/ToolsFreshMt"
import ToolsFreshElm from "./pages/tools/ToolsFreshElm"
// import ToolsTests from "./pages/tools/ToolsTests"
// import ToolsFoodMt from "./pages/tools/ToolsFoodMt"
// import ToolsFoodElm from "./pages/tools/ToolsFoodElm"
// import ToolsFoodSubMt from "./pages/tools/ToolsFoodSubMt"
// import ToolsDelivery from "./pages/tools/ToolsDelivery"
// import ToolsFullDiscount from "./pages/tools/ToolsFullDiscount"
// import ToolsOrderCoupon from "./pages/tools/ToolsOrderCoupon"
// import ToolsSealFullDiscountCoupon from "./pages/tools/ToolsSealFullDiscountCoupon"
// import ToolsPoiInnerCoupon from "./pages/tools/ToolsPoiInnerCoupon"
// import ToolsCollectCoupon from "./pages/tools/ToolsCollectCoupon"
import ToolsPicMt from "./pages/tools/ToolsPicMt"
import ToolsPicElm from "./pages/tools/ToolsPicElm"
import ToolsImReply from "./pages/tools/ToolsImReply"
// import ToolsWhiteList from './pages/tools/ToolsWhiteList'
// import ToolsWhiteListRedirect from "./pages/tools/ToolsWhiteListRedirect"

import Sum from "./pages/date/Sum"
import Sum2 from "./pages/date/Sum2"
import Perf from "./pages/date/Perf"
import Perf2 from "./pages/date/Perf2"
import Note from "./pages/notes/Note"
import ActivityComments from "./components/user/ActivityComments"

export const routes = [
  { path: "/shop/:shopid(\\d+)", name: "shop", component: Shop },
  { path: "/user/:username/:date(\\d+)", name: "user", component: User },
  { path: "/changes", name: "changes", component: Change },
  // { path: "/tasks", name: "tasks", component: Tasks },
  { path: "/probs", name: "probs", component: Prob },
  { path: "/probs2", name: "probs2", component: Prob2 },
  { path: "/probs3", name: "probs3", component: Prob3 },
  { path: "/probs4", name: "probs4", component: Prob4 },
  { path: "/probs5", name: "probs5", component: Prob5 },
  { path: "/probs6", name: "probs6", component: Prob6 },
  { path: "/probs7", name: "probs7", component: Prob7 },
  
  { path: "/tools/food", name: "tools-food", component: ToolsFood },
  { path: "/tools/fooddiff", name: "tools-food-diff", component: ToolsFoodDiff },

  // { path: "/tools/add/fresh", name: "tools-add-fresh", component: ToolsAddFresh },
  { path: "/tools/fresh/mt", name: "tools-fresh-mt", component: ToolsFreshMt },
  { path: "/tools/fresh/elm", name: "tools-fresh-elm", component: ToolsFreshElm },
 
  // { path: "/tools/delivery", name: "tools-delivery", component: ToolsDelivery },

  { path: "/tools/pic/mt", name: "tools-pic-mt", component: ToolsPicMt },
  { path: "/tools/pic/elm", name: "tools-pic-elm", component: ToolsPicElm },
  
  { path: "/tools/im/reply", name: "tools-im-reply", component: ToolsImReply },

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
  { path: "/:pathMatch(.*)*", name: "not-found", component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
