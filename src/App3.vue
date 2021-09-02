<template lang="pug">
div
  .tag-container
    a-tag(
      v-for="route in routes",
      :key="route.path",
      :color="route.color",
      closable,
      @close="() => removeRoute(route)"
    ) 
      span(@click="() => updateRoute(route)")
        router-link(:to="{ path: route.path }") {{ route.title }}
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

    a-menu-item(key="date")
      a-date-picker(
        v-model:value="selected_date",
        @change="date_change",
        :allowClear="false",
        size="small"
      )

    a-sub-menu
      template(#title)
        span check
      a-menu-item(key="problems")
        router-link(:to="{ name: 'probs' }") 问题
      a-menu-item(key="changes")
        router-link(:to="{ name: 'changes' }") 变化

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
      a-menu-item(v-for="name in 新人培训", :key="name")
        a(:href="`http://192.168.3.3:8080/${name}`", target="_blank") {{ name.replace(/\..*/, '') }}

    a-menu-item(key="notes")
      router-link(:to="{ name: 'note' }") notes

  router-view(v-slot="{ Component }")
    transition
      keep-alive
        component(:is="Component")
</template>

<script>
  import User from "./api/user";
  import dayjs from "dayjs";
  import moment from "moment";

  export default {
    data() {
      return {
        menu_keys: [],
        all_names: [],
        新人培训: [
          "订单缺陷率.html",
          "评价管理.html",
          "刷单操作手册.html",
          "新店工作安排.html",
          "新员工培训流程.html",
          "运营工作优化.html",
          "运营思维.html",
          "低业绩影响因素.html",
          "外卖优化方向.pdf",
          "外卖培训.pdf",
          "自配送工作总结.pdf",
          "【三顾冒菜】专享会.pdf",
          "饿了么新商户上线操作.pdf",
        ],
        routes: [],
        routeNames: [
          { name: "shop", title: "门店" },
          { name: "user", title: "用户" },
          { name: "user-acts", title: "动态" },
          { name: "changes", title: "变化" },
          { name: "probs", title: "问题" },
          { name: "tools", title: "工具" },
          { name: "tools-add-fresh", title: "新店录入" },
          { name: "tools-add-fengniao", title: "蜂鸟录入" },
          { name: "tools-add-dada", title: "达达录入" },
          { name: "tools-add-shunfeng", title: "顺丰录入" },
          { name: "tools-add-myt", title: "麦芽田录入" },
          { name: "tools-fresh-mt", title: "美团新店" },
          { name: "tools-fresh-elm", title: "饿了么新店" },
          { name: "tools-food-mt", title: "美团改价" },
          { name: "tools-food-sub-mt", title: "美团替换" },
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
        ],
        selected_date: moment().subtract(1, "days"),
      };
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
      date_change(date, date_str) {
        let date1 = dayjs()
          .startOf("day")
          .diff(dayjs(date_str).startOf("day"), "day");
        if (date1 <= 0) return;
        this.$router.replace({ name: "date", params: { day: date1 } });
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
        this.routes = this.routes.filter((v) => v.path != r.path);
        this.saveRoutes();
      },
      updateRoute(r) {
        let i = this.routes.findIndex((v) => v.path == r.path);
        if (i >= 0) {
          this.routes = this.routes.map((v) => ({ ...v, color: "default" }));
          this.routes[i].color = "blue";
        }
        this.saveRoutes();
      },
      getRouteTitle(r) {
        // if (r.name == "date") return "主表" + r.params.day;
        if (r.name == "user") return r.params?.username + r.params?.date;
        return this.routeNames.find((v) => v.name == r.name)?.title ?? "-";
        // return "-";
      },
    },
    created() {
      this.fetch_all_names();
      this.getRoutes();
    },
    watch: {
      $route(route) {
        let title = this.getRouteTitle(route);
        if (title == "-" || this.routes.find((v) => v.title == title)) return;
        this.routes = [...this.routes, { ...route, title, color: "default" }];
        this.updateRoute(route);
        console.log(this.routes);
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
  border: none !important

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
</style>
