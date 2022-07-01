<template lang="pug">
ProbBase(probType="bk", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbBK",
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
            title: "店铺ID",
            dataIndex: "shop_id",
            width: 80,
          },
          {
            title: "门店名称",
            dataIndex: "shop_name",
            width: 250,
          },
          {
            title: "物理店",
            dataIndex: "real_shop_name",
            width: 80,
          },
          {
            title: "城市",
            dataIndex: "city",
            width: 100,
          },
          {
            title: "配送范围",
            dataIndex: "shop_product_desc",
            width: 150,
          },
          {
            title: "起送价",
            dataIndex: "price_items",
            width: 100,
            _sort: true,
            _filter: true,
          },
          {
            title: "配送费",
            dataIndex: "delivery_fee_items",
            width: 100,
            _sort: true,
            _filter: true,
          },
          {
            title: "时段",
            dataIndex: "multi_times",
            width: 150,
          },
          {
            title: "处理",
            dataIndex: "handle",
            width: 150,
          },
        ],
      };
    },
  };
</script>
