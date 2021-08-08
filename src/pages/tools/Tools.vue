<template lang="pug">
.tools
  a-menu.menu(mode="inline", theme="light", v-model:openKeys="menu_open_keys")
    a-sub-menu(key="new-shop-setting", title="新店设置")
      a-menu-item(key="new-shop-setting:mt") 
        router-link(:to="{ name: 'tools-fresh-mt' }") 美团
      a-menu-item(key="new-shop-setting:elm") 
        router-link(:to="{ name: 'tools-fresh-elm' }") 饿了么

    a-sub-menu(key="info-setting", title="信息录入")
      a-menu-item(key="whitelist") 
        router-link(:to="{ name: 'tools-white-list' }") 白名单
      a-menu-item(key="add-new-shop") 
        router-link(:to="{ name: 'tools-add-fresh' }") 新店
      a-menu-item(key="add-fengniao") 
        router-link(:to="{ name: 'tools-add-fengniao' }") 蜂鸟
      a-menu-item(key="add-dada") 
        router-link(:to="{ name: 'tools-add-dada' }") 达达
      a-menu-item(key="add-myt") 
        router-link(:to="{ name: 'tools-add-myt' }") 麦芽田
      a-menu-item(key="add-shunfeng") 
        router-link(:to="{ name: 'tools-add-shunfeng' }") 顺丰

    a-sub-menu(key="food-setting", title="价格修改")
      a-menu-item(key="food-setting:mt")
        router-link(:to="{ name: 'tools-food-mt' }") 美团
      a-menu-item(key="food-setting:elm")
        router-link(:to="{ name: 'tools-food-elm' }") 饿了么

    a-sub-menu(key="pic-setting", title="图片上传")
      a-menu-item(key="pic-setting:mt")
        router-link(:to="{ name: 'tools-pic-mt' }") 美团
      a-menu-item(key="pic-setting:elm")
        router-link(:to="{ name: 'tools-pic-elm' }") 饿了么

    a-menu-item(key="tests:sync/del") 
      router-link(:to="{ name: 'tools-tests' }") 测试产品
  div(style="flex-grow: 1; overflow: auto")
    router-view
</template>

<script>
  export default {
    name: "tools",
    data() {
      return {
        menu_open_keys: [
          "new-shop-setting",
          "info-setting",
          "food-setting",
          "pic-setting",
        ],
      };
    },
  };
</script>

<style lang="sass" scoped>
.tools
  display: flex
  width: 100%
  height: calc(100vh - 48px)

.menu
  width: 200px
  flex-shrink: 0
  flex-grow: 0
</style>