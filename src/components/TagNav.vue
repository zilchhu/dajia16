<template lang="pug">
div.tag-container
  a-tag(
    v-for="route in routes",
    :key="route.path",
    closable,
    @close="() => removeRoute(route)"
  ) 
    router-link(:to="route") {{ routeNames[route.name] }}
</template>

<script>
  export default {
    name: "tag-nav",
    data() {
      return {
        routes: [],
        routeNames: [
          { name: "shop", title: "门店" },
          { name: "user", title: '用户' },
          { name: "user-acts", title: '动态'},
          { name: "changes", title: '变化'},
          { name: "probs", title: '问题'},
          { name: "tools", title: '工具'},
          { name: "tools-add-fresh", title: '新店录入'},
          { name: "tools-add-fengniao", title: '蜂鸟录入'},
          { name: "tools-add-dada", title: '达达录入'},
          { name: "tools-add-shunfeng", title: '顺丰录入'},
          { name: "tools-add-myt", title: '麦芽田录入'},
          { name: "tools-fresh-mt", title: '美团新店'},
          { name: "tools-fresh-elm", title: '饿了么新店'},
          { name: "tools-food-mt", title: '美团改价'},
          { name: "tools-food-elm", title"饿了么改价" },
          { name: "tools-pic-mt", title: '美团图片' },
          { name: "tools-pic-elm", title: '饿了么图片' },
          { name: "tools-white-list", title: '白名单' },
          { name: "tools-tests", title: '美团测试' },
          { name: "date", title: '主表' },
          { name: "sum", title: '营推汇总' },
          { name: "sum2", title: '营推月汇总' },
          { name: "perf", title: '绩效' },
          { name: "perf2", title: '绩效2' },
          { name: "fresh-shop", title: '新店' },
          { name: "activity-comments", title: '评论' },
          { name: "note", title: "note" },
          { name: "index", title: '首页' },
        ],
      };
    },
    methods: {
      removeRoute(r) {
        this.routes = this.routes.filter(v => v.path != r.path)
      }
    },
    watch: {
      $route(route) {
        console.log(route);
        if(this.routes.find(v => v.path == route.path)) return
        this.routes = [...this.routes, route]
      },
    },
  };
</script>

<style lang="sass" scoped>
  .tag-container
    display: flex
    overflow: auto
    align-items: center
    column-gap: 4px 
</style>