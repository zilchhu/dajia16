<template lang="pug">
div(style="position: relative")
  .tag-container
    a-tag(
      v-for="route in routes",
      :key="route.path",
      :color="route.color",
      closable,
      @close="() => removeRoute(route)"
    ) 
      span(@click="changeRoute(route)") 
        router-link(:to="{ path: route.path }") {{ route.title }}

  .user-info(
    style="position: absolute; top: 4px; right: 10px; cursor: pointer"
  )
    div(v-if="account == null", @click="login") 未登录
    div(v-else)
      a-dropdown(placement="bottomLeft")
        div {{ account }}
        template(#overlay)
          a-menu
            a-menu-item
              div(@click="logout") 退出登录
            a-menu-item
              div(@click="login") 重新登录

  a-modal(
    v-model:visible="login_modal_show",
    :title="null",
    :footer="null",
    centered,
    :width="650"
  )
    Login(@login-success="onLoginSuccess")

  a-menu(v-model:selectedKeys="menu_keys", theme="light", mode="horizontal")
    a-sub-menu(key="aggre")
      template(#title)
        span aggre
      a-menu-item(key="sum:3")
        router-link(:to="{ name: 'sum', params: { day: 7 } }") 营推(天)
      a-menu-item(key="sum2")
        router-link(:to="{ name: 'sum2' }") 营推(月)
      a-menu-item(key="fresh-shop")
        router-link(:to="{ name: 'fresh-shop' }") 新店
      a-menu-item(key="perf:31")
        router-link(:to="{ name: 'perf', params: { day: 31 } }") 绩效
      a-menu-item(key="perf2")
        router-link(:to="{ name: 'perf2' }") 绩效2
      a-menu-item(key="records")
        router-link(:to="{ name: 'records' }") 优化指标

    a-menu-item(key="date")
      div(@click="onDatePickerClick")
        a-date-picker(
          v-model:value="selected_date",
          @change="date_change",
          :allowClear="false",
          size="small",
          :bordered="false"
        )

    a-sub-menu(key="checks")
      template(#title)
        span checks
      a-menu-item(key="problems")
        router-link(:to="{ name: 'probs' }") 自配送
      a-menu-item(key="problems2")
        router-link(:to="{ name: 'probs2' }") 管理员
      a-menu-item(key="problems3")
        router-link(:to="{ name: 'probs3' }") 日常检查
      a-menu-item(key="problems4")
        router-link(:to="{ name: 'probs4' }") 门店沟通
      a-menu-item(key="problems5")
        router-link(:to="{ name: 'probs5' }") 基础提醒
      a-menu-item(key="problems6")
        router-link(:to="{ name: 'probs6' }") 日常跟进
      a-menu-item(key="problems7")
        router-link(:to="{ name: 'probs7' }") 账号录入
      a-menu-item(key="changes")
        router-link(:to="{ name: 'changes' }") 变化

    a-sub-menu(key="users")
      template(#title)
        span users
      a-menu-item(v-for="name in all_names", :key="name")
        router-link(
          :to="{ name: 'user', params: { username: name || '-', date: $route.params.date || 0 } }"
        ) {{ name }}

    a-sub-menu(key="tools")
      template(#title)
        span tools
      a-menu-item(key="tools-fresh-mt")
        router-link(:to="{ name: 'tools-fresh-mt' }") 美团新店设置
      a-menu-item(key="tools-fresh-elm")
        router-link(:to="{ name: 'tools-fresh-elm' }") 饿了么新店设置
      a-menu-item(key="tools-food")
        router-link(:to="{ name: 'tools-food' }") 修改商品/活动
      a-menu-item(key="tools-pic-mt")
        router-link(:to="{ name: 'tools-pic-mt' }") 美团图片上传
      a-menu-item(key="tools-pic-elm")
        router-link(:to="{ name: 'tools-pic-elm' }") 饿了么图片上传
      a-menu-item(key="tools-im-reply")
        router-link(:to="{ name: 'tools-im-reply' }") IM回复配置

    a-sub-menu(key="trains")
      template(#title)
        span trains
      a-menu-item(v-for="item in trainingIndex", :key="item.url")
        a(:href="item.url", target="_blank") {{ item.title }}

    a-menu-item(key="notes")
      router-link(:to="{ name: 'note' }") notes

  router-view(v-slot="{ Component }")
    keep-alive(:max="10")
      component(:is="Component")
</template>

<script>
import app from "apprun"
import dayjs from "dayjs"
import moment from "moment"
import { message } from "ant-design-vue"
import Login from "./components/user/Login"
import baseFetch from "./api/base"

export default {
  components: {
    Login,
  },
  data() {
    return {
      menu_keys: [],
      all_names: [],
      trainingIndex: [],
      routes: [],
      lastRoute: { title: "" },
      routeNames: [
        { name: "shop", title: "门店" },
        { name: "user", title: "用户" },
        { name: "user-acts", title: "动态" },
        { name: "changes", title: "变化" },
        { name: "tasks", title: "任务" },
        { name: "probs", title: "自配送检查" },
        { name: "probs2", title: "管理员检查" },
        { name: "probs3", title: "日常检查" },
        { name: "probs4", title: "门店沟通" },
        { name: "probs5", title: "基础提醒" },
        { name: "probs6", title: "日常跟进" },
        { name: "tools", title: "工具" },
        { name: "tools-add-fresh", title: "新店录入" },
        { name: "tools-add-sss", title: "闪时送录入" },
        { name: "tools-add-zps", title: "自配送录入" },
        { name: "tools-fresh-mt", title: "美团新店" },
        { name: "tools-fresh-elm", title: "饿了么新店" },
        { name: "tools-food", title: "商品/活动★" },
        { name: "tools-food-diff", title: "商品对比" },
        { name: "tools-pic-mt", title: "美团图片" },
        { name: "tools-pic-elm", title: "饿了么图片" },
        { name: "tools-im-reply", title: "IM" },
        { name: "date", title: "主表" },
        { name: "sum", title: "营推汇总" },
        { name: "sum2", title: "营推月汇总" },
        { name: "perf", title: "绩效" },
        { name: "perf2", title: "绩效2" },
        { name: "fresh-shop", title: "新店" },
        { name: "activity-comments", title: "评论" },
        { name: "note", title: "note" },
        { name: "index", title: "首页" },
        { name: "records", title: "优化指标" },
      ],
      selected_date: dayjs().subtract(1, "day"),
      login_modal_show: false,
    }
  },
  computed: {
    account() {
      return this.$store.state.account
    },
    token() {
      return this.$store.state.token
    },
  },
  methods: {
    fetch_all_names() {
      baseFetch({
        url: "/v1/users/names",
      })
        .then((res) => {
          this.all_names = res.filter((v) => v != null)
        })
        .catch((err) => message.error(err.message))
    },
    fetchTrainingIndex() {
      baseFetch({
        url: "/v1/trains",
      })
        .then((res) => (this.trainingIndex = res))
        .catch((err) => message.error(err.message))
    },
    date_change(date, date_str) {
      console.log("date_change", date_str)

      let date1 = dayjs().startOf("day").diff(dayjs(date_str).startOf("day"), "day")

      if (date1 <= 0) return

      this.$router.replace({
        name: "date",
        params: { day: date1 },
      })
    },
    disabledDate(currentDate) {
      return currentDate.isAfter(moment().subtract(1, "days"))
    },
    onDatePickerClick() {
      let oldRoute = this.routes.find((v) => v.title == "营推")
      if (oldRoute) {
        this.$router.replace(oldRoute.path)
      } else {
        this.date_change(this.selected_date, this.selected_date.format("YYYY-MM-DD"))
      }
    },
    saveRoutes() {
      localStorage.setItem(
        "routes",
        JSON.stringify(
          this.routes.map((v) => ({
            path: v.path,
            color: v.color,
            title: v.title,
          }))
        )
      )
    },
    getRoutes() {
      let sroutes = localStorage.getItem("routes")
      if (sroutes) {
        this.routes = JSON.parse(sroutes)
      }
    },
    removeRoute(r) {
      this.routes = this.routes.filter((v) => v.title != r.title)
      this.saveRoutes()
    },
    removeRoutes(start, end) {
      this.routes = this.routes.slice(start, end)
      this.saveRoutes()
    },
    updateRoute(r) {
      let i = this.routes.findIndex((v) => v.title == r.title)
      if (i >= 0) {
        this.routes = this.routes.map((v) => ({ ...v, color: "default" }))
        this.routes[i] = { ...r, color: "blue" }
      }
      this.saveRoutes()
    },
    changeRoute(r) {
      let activeRoute = this.routes.find((v) => v.color == "blue")
      if (r.title == activeRoute?.title) {
        // this.$router.push({
        //   to: { path: r.path },
        //   query: { r: Math.random() },
        // });
      } else {
        // this.$router.push({ to: { path: r.path } });
      }
      console.log(r, this.lastRoute)
    },
    getRouteTitle(r) {
      // if (r.name == "date") return "主表" + r.params.day;
      if (r.name == "user") return r.params?.username
      // if (r.name == "shop" && r.query?.name) {
      //   let suffix = r.query?.name?.match(/[（(](.*店)[）)]/);
      //   return suffix ? suffix[1] : r.query?.name;
      // }
      if (r.name == "date") return "营推"
      // return "主表" + (r.params?.day == 1 ? "(最新)" : r.params?.day);
      return this.routeNames.find((v) => v.name == r.name)?.title ?? "-"
      // return "-";
    },
    initUserAccount() {
      this.user_account = localStorage.getItem("account")
    },
    logout() {
      baseFetch({
        method: "POST",
        url: "/v1/logout",
        data: {
          token: this.token,
        },
      })
        .then((res) => {
          message.success("退出登录成功")
          this.$store.commit("setAccount", null)
          this.$store.commit("setToken", null)
        })
        .catch((err) => message.error(err.message))
    },
    login() {
      this.login_modal_show = true
    },
    onLoginSuccess() {
      this.login_modal_show = false
    },
    onWsClose(state) {
      message.error(state.error)
    },
    onWsOpen(state) {
      message.success(state.result)
    },
  },
  created() {
    app.on("ws-open", this.onWsOpen)
    app.on("ws-close", this.onWsClose)

    this.fetch_all_names()
    this.fetchTrainingIndex()
    this.getRoutes()
    this.initUserAccount()
  },
  unmounted() {
    app.off("ws-open", this.onWsOpen)
    app.off("ws-close", this.onWsClose)
  },
  watch: {
    $route(route, oldRoute) {
      this.lastRoute = { ...oldRoute, title: this.getRouteTitle(oldRoute) }
      let title = this.getRouteTitle(route)
      if (title == "-") return
      if (title == "营推")
        this.selected_date = dayjs().subtract(+route.params.day, "days")

      if (this.routes.find((v) => v.title == title)) {
        this.updateRoute({ ...route, title })
        return
      }
      if (this.routes.length > 10) this.removeRoutes(this.routes.length - 10)
      this.routes = [...this.routes, { ...route, title, color: "default" }]
      this.updateRoute({ ...route, title })
    },
  },
}
</script>

<style lang="sass">
::-webkit-scrollbar
  display: block
  width: 10px
  height: 10px
  background: rgba(241,241,241,.7)
  overflow: auto

::-webkit-scrollbar-thumb
  background: rgba(168,168,168,.6)

.ant-table-pagination.ant-pagination
  margin: 6px 0 !important

.ant-menu-horizontal
  line-height: 36px !important

.note-main .ant-list-item-meta-title
  margin: 0 !important

.note-main .ant-list-vertical .ant-list-item-meta
  margin-bottom: 0 !important

.tag-container
  display: flex
  overflow: auto
  align-items: center

.success-color
  color: rgb(135, 203, 255)

.error-color
  color: rgb(255, 143, 138)
</style>
