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
    div(v-if="!account", @click="login") 未登录
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
    a-sub-menu
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
      a-date-picker(
        v-model:value="selected_date",
        @change="date_change",
        :allowClear="false",
        size="small",
        :bordered="false"
      )

    a-sub-menu
      template(#title)
        span check
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
      a-menu-item(key="changes")
        router-link(:to="{ name: 'changes' }") 变化
      a-menu-item(key="tasks")
        router-link(:to="{ name: 'tasks' }") 任务

    a-sub-menu
      template(#title)
        span users
      a-menu-item(v-for="name in all_names", :key="name")
        router-link(
          :to="{ name: 'user', params: { username: name || '-', date: $route.params.date || 0 } }"
        ) {{ name }}

    a-menu-item(key="tools")
      router-link(:to="{ name: 'tools' }") tools

    a-sub-menu
      template(#title)
        span 新人培训
      a-menu-item(v-for="item in trainingIndex", :key="item.url")
        a(:href="item.url", target="_blank") {{ item.title }}

    a-menu-item(key="notes")
      router-link(:to="{ name: 'note' }") notes

  router-view(v-slot="{ Component }")
    keep-alive
      component(:is="Component")
</template>

<script>
  import app from "apprun";
  import dayjs from "dayjs";
  import moment from "moment";
  import { message } from "ant-design-vue";
  import User from "./api/user";
  import query from "./api/query";
  import ins from "./api/base4";
  import Login from "./components/user/Login";

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
          { name: "tools", title: "工具" },
          { name: "tools-add-fresh", title: "新店录入" },
          { name: "tools-add-fengniao", title: "蜂鸟录入" },
          { name: "tools-add-dada", title: "达达录入" },
          { name: "tools-add-shunfeng", title: "顺丰录入" },
          { name: "tools-add-myt", title: "麦芽田录入" },
          { name: "tools-add-sss", title: "闪时送录入" },
          { name: "tools-add-zps", title: "自配送录入" },
          { name: "tools-fresh-mt", title: "美团新店" },
          { name: "tools-fresh-elm", title: "饿了么新店" },
          { name: "tools-food", title: "商品★" },
          { name: "tools-food-diff", title: "商品对比" },
          { name: "tools-act", title: "活动★" },
          { name: "tools-food-mt", title: "美团改价" },
          { name: "tools-food-sub-mt", title: "美团替换" },
          { name: "tools-delivery", title: "减配送费" },
          { name: "tools-full-discount", title: "满减活动" },
          { name: "tools-order-coupon", title: "下单返券" },
          { name: "tools-seal-full-discount-coupon", title: "售卖代金券" },
          { name: "tools-poi-inner-coupon", title: "店内返券" },
          { name: "tools-collect-coupon", title: "收藏领券" },
          { name: "tools-food-elm", title: "饿了么改价" },
          { name: "tools-pic-mt", title: "美团图片" },
          { name: "tools-pic-elm", title: "饿了么图片" },
          { name: "tools-white-list", title: "白名单" },
          { name: "tools-tests", title: "美团测试" },
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
      };
    },
    computed: {
      account() {
        return this.$store.state.account ?? localStorage.getItem("account");
      },
      token() {
        return this.$store.state.token ?? localStorage.getItem("token");
      },
    },
    methods: {
      fetch_all_names() {
        new User("")
          .all_names()
          .then((res) => {
            this.all_names = res;
          })
          .catch((err) => console.error(err));
      },
      fetchTrainingIndex() {
        query("get-training-index")
          .then((res) => (this.trainingIndex = res))
          .catch((err) => console.error(err));
      },
      date_change(date, date_str) {
        console.log("date_change", date_str);

        let date1 = dayjs()
          .startOf("day")
          .diff(dayjs(date_str).startOf("day"), "day");

        if (date1 <= 0) return;

        this.$router.replace({
          name: "date",
          params: { day: date1 },
          // query: { d: date_str },
        });
      },
      disabledDate(currentDate) {
        return currentDate.isAfter(moment().subtract(1, "days"));
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
        );
      },
      getRoutes() {
        let sroutes = localStorage.getItem("routes");
        if (sroutes) {
          this.routes = JSON.parse(sroutes);
        }
      },
      removeRoute(r) {
        this.routes = this.routes.filter((v) => v.title != r.title);
        this.saveRoutes();
      },
      removeRoutes(start, end) {
        this.routes = this.routes.slice(start, end);
        this.saveRoutes();
      },
      updateRoute(r) {
        let i = this.routes.findIndex((v) => v.title == r.title);
        if (i >= 0) {
          this.routes = this.routes.map((v) => ({ ...v, color: "default" }));
          this.routes[i] = { ...r, color: "blue" };
        }
        this.saveRoutes();
      },
      changeRoute(r) {
        let activeRoute = this.routes.find((v) => v.color == "blue");
        if (r.title == activeRoute?.title) {
          // this.$router.push({
          //   to: { path: r.path },
          //   query: { r: Math.random() },
          // });
        } else {
          // this.$router.push({ to: { path: r.path } });
        }
        console.log(r, this.lastRoute);
      },
      getRouteTitle(r) {
        // if (r.name == "date") return "主表" + r.params.day;
        if (r.name == "user") return r.params?.username;
        // if (r.name == "shop" && r.query?.name) {
        //   let suffix = r.query?.name?.match(/[（(](.*店)[）)]/);
        //   return suffix ? suffix[1] : r.query?.name;
        // }
        if (r.name == "date") return "营推";
        // return "主表" + (r.params?.day == 1 ? "(最新)" : r.params?.day);
        return this.routeNames.find((v) => v.name == r.name)?.title ?? "-";
        // return "-";
      },
      initUserAccount() {
        this.user_account = localStorage.getItem("account");
      },
      logout() {
        const token = localStorage.getItem("token");
        ins({
          data: {
            event: "logout",
            account: this.account,
            token,
          },
        })
          .then((res) => {
            message.success("退出登录成功");
            this.$store.commit("setAccount", null);
            this.$store.commit("setToken", null);
          })
          .catch((err) => message.error(err));
      },
      login() {
        this.login_modal_show = true;
      },
      onLoginSuccess() {
        this.login_modal_show = false;
      },
      onWsClose(state) {
        message.error(state.error);
      },
      onWsOpen(state) {
        message.success(state.result);
      },
    },
    created() {
      app.on("ws-open", this.onWsOpen);
      app.on("ws-close", this.onWsClose);

      this.fetch_all_names();
      this.fetchTrainingIndex();
      this.getRoutes();
      this.initUserAccount();
    },
    unmounted() {
      app.off("ws-open", this.onWsOpen);
      app.off("ws-close", this.onWsClose);
    },
    watch: {
      $route(route, oldRoute) {
        this.lastRoute = { ...oldRoute, title: this.getRouteTitle(oldRoute) };
        let title = this.getRouteTitle(route);
        if (title == "-") return;
        if (title == "营推")
          this.selected_date = dayjs().subtract(+route.params.day, "days");

        if (this.routes.find((v) => v.title == title)) {
          this.updateRoute({ ...route, title });
          return;
        }
        if (this.routes.length > 10) this.removeRoutes(this.routes.length - 10);
        this.routes = [...this.routes, { ...route, title, color: "default" }];
        this.updateRoute({ ...route, title });
      },
    },
  };
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
  border-bottom: none !important

.ant-comment-inner
  padding: 0 !important

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
