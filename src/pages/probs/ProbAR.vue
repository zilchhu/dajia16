<template lang="pug">
ProbBase(probType="ar", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseA.vue";

  export default {
    name: "ProbAR",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "负责人",
            dataIndex: "person",
            width: 80,
          },
          {
            title: "店铺id",
            dataIndex: "shop_id",
            width: 90,
          },
          {
            title: "店名",
            dataIndex: "shop_name",
            width: 250,
          },
          {
            title: "物理店",
            dataIndex: "real_shop_name",
            width: 100,
          },
          {
            title: "收藏有礼",
            dataIndex: "收藏有礼",
          },
          {
            title: "店内领券",
            dataIndex: "店内领券",
          },
          {
            title: "超值换购",
            dataIndex: "超值换购",
          },
          {
            title: "满赠活动",
            dataIndex: "满赠活动",
          },
          {
            title: "下单返券",
            dataIndex: "下单返券",
          },
          {
            title: "集点返券",
            dataIndex: "集点返券",
          },
          {
            title: "平台新客立减",
            dataIndex: "平台新客立减",
          },
          {
            title: "店外发券",
            dataIndex: "店外发券",
          },
          {
            title: "售卖代金券",
            dataIndex: "售卖代金券",
          },
          {
            title: "处理",
            dataIndex: "handle",
          },
        ],
      };
    },
  };
</script>
