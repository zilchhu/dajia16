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
              { title: "自配送账号", to: { name: "tools-add-zps" } },
              { title: "闪时送门店关系", to: { name: "tools-add-sss" } },
              { title: "新店", to: { name: "tools-add-fresh" } },
              // { title: "蜂鸟", to: { name: "tools-add-fengniao" } },
              // { title: "达达", to: { name: "tools-add-dada" } },
              // { title: "麦芽田", to: { name: "tools-add-myt" } },
              // { title: "顺丰", to: { name: "tools-add-shunfeng" } },
            ],
          },
          {
            title: "商品★",
            items: [
              { title: "修改商品", to: { name: "tools-food" } },
              { title: "美团图片上传", to: { name: "tools-pic-mt" } },
              { title: "饿了么图片上传", to: { name: "tools-pic-elm" } },
              { title: "美团测试产品", to: { name: "tools-tests" } },
            ],
          },
          {
            title: "活动★",
            items: [
              { title: "修改美团活动", to: { name: "tools-act" } },
              // { title: "减配送费", to: { name: "tools-delivery" } },
              // { title: "满减活动", to: { name: "tools-full-discount" } },
              // { title: "下单返券", to: { name: "tools-order-coupon" } },
              // {
              //   title: "售卖代金券",
              //   to: { name: "tools-seal-full-discount-coupon" },
              // },
              // { title: "店内领券", to: { name: "tools-poi-inner-coupon" } },
              // { title: "收藏领券", to: { name: "tools-collect-coupon" } },
            ],
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