<template lang="pug">
ProbBase(probType="aq", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseA.vue";

  export default {
    name: "ProbAQ",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "责任人",
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
            title: "超级吃货红包",
            dataIndex: "超级吃货红包",
          },
          {
            title: "下单返红包",
            dataIndex: "下单返红包",
          },
          {
            title: "吃货红包",
            dataIndex: "吃货红包",
          },
          {
            title: "集点返红包",
            dataIndex: "集点返红包",
          },
          {
            title: "店铺满赠",
            dataIndex: "店铺满赠",
          },
          {
            title: "进店领红包",
            dataIndex: "进店领红包",
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
