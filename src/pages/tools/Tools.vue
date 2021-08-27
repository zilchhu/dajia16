<template lang="pug">
.tools
  div(v-for="menu in menus", :key="menu.title")
    h4 {{ menu.title }}
    .sub-menu
      .menu-item(v-for="item in menu.items", :key="item.title")
          router-link(:to="item.to") {{ item.title }}
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
        menus: [
          {
            title: "新店设置",
            items: [
              { title: "美团", to: { name: "tools-fresh-mt" } },
              { title: "饿了么", to: { name: "tools-fresh-elm" } },
            ],
          },
          {
            title: "信息录入",
            items: [
              { title: "新店", to: { name: "tools-add-fresh" } },
              { title: "蜂鸟", to: { name: "tools-add-fengniao" } },
              { title: "达达", to: { name: "tools-add-dada" } },
              { title: "麦芽田", to: { name: "tools-add-myt" } },
              { title: "顺丰", to: { name: "tools-add-shunfeng" } },
            ],
          },
          {
            title: "价格修改★",
            items: [
              { title: "美团", to: { name: "tools-food-mt" } },
              { title: "饿了么", to: { name: "tools-food-elm" } },
            ],
          },
          {
            title: "图片上传",
            items: [
              { title: "美团", to: { name: "tools-pic-mt" } },
              { title: "饿了么", to: { name: "tools-pic-elm" } },
            ],
          },
          {
            title: "测试产品",
            items: [{ title: "美团", to: { name: "tools-tests" } }],
          },
        ],
      };
    },
  };
</script>

<style lang="sass" scoped>
.tools
  width: 70%
  margin: 40px auto

.menu
  width: 200px
  flex-shrink: 0
  flex-grow: 0

.sub-menu
  display: flex
  align-items: center

.menu-item
  width: 140px
  height: 60px
</style>