<template lang="pug">
.detail
  a-spin(:spinning="loading")
    //- div(style="max-height: 600px; overflow-y: auto")
    //-   section(v-if="detail.basic")
    //-     div {{ detail.basic.name }}
    //-     div {{ detail.basic.tagName }}
    //-   section(v-if="detail.skus")
    //-     div(v-for="sku in detail.skus", :key="sku.id")
    //-       div {{ sku.id }}
    //-       div {{ sku.name }}
    //-       div {{ sku.price }}
    //-       div {{ sku.act?.price }}
    //-       div {{ sku.box.price }}
    //-       div {{ sku.stock }}
    //-   section(v-if="detail.attrs?.weights")
    //-     div(v-for="attr in detail.attrs.weights", :key="attr.id")
    //-       div {{ attr.value }}
    //-       div {{ attr.weight }}
    //-       div {{ attr.weightUnit }}
    //-       div {{ attr.price }}
    //-       div {{ attr.sellStatus }}
    //-   section(v-if="detail.attrs?.others")
    //-     div(v-for="attr in detail.attrs", :key="attr.id")
    //-       div {{ attr.name }}
    //-       div {{ attr.value }}
    //-       div {{ attr.price }}
    //-       div {{ attr.sellStatus }}
    //-   section(v-if="detail.basic")
    //-     div {{ detail.minOrderCount }}
    //-     div {{ detail.singleOrderNoDelivery }}
    //-     div {{ detail.featureInPoi }}
    //-   section(v-if="detail.category")
    //-     div {{ detail.category.name }}
    //-   section(v-if="detail.properties")
    //-     div(v-for="prop in detail.properties", :key="prop.id")
    //-       div {{ prop.name }}
    //-       div {{ prop.values }}
    div(style="white-space: pre-wrap") {{ detail }}

  div(v-if="!loading", style="margin-type: 12px")
    a-button(type="link", @click="fetchFoodDetail") 刷新
</template>

<script>
  import app from "apprun";
  import { message } from "ant-design-vue";

  export default {
    name: "tools-food-detail",
    props: ["taskId", "i"],
    data() {
      return {
        loading: false,
        detail: "",
      };
    },
    methods: {
      fetchFoodDetail() {
        console.log("detail", this.taskId, this.i);
        if (this.taskId == null || this.i == null) return;
        this.loading = true;
        app.run("ws://", "get-food-task-food-detail", {
          id: this.taskId,
          _i: this.i,
        });
      },
      onGetFoodTaskFoodDetail(state) {
        if (state.error) message.error(state.error);
        this.detail = state.result.detail;
        this.loading = false;
      },
    },
    created() {
      app.on("get-food-task-food-detail-res", this.onGetFoodTaskFoodDetail);
    },
    watch: {
      taskId() {
        this.fetchFoodDetail();
      },
      i() {
        this.fetchFoodDetail();
      },
    },
    unmounted() {
      app.off("get-food-task-food-detail-res", this.onGetFoodTaskFoodDetail);
    },
  };
</script>

<style lang="sass" scoped>
section
  .title
    font-size: 1.2em
    .body
      .field
        display: flex
        align-items: flex-start
        column-gap: 4px
      .label
        width: 6em
        flex-shrink: 1
</style>
