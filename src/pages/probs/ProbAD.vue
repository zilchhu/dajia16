<template lang="pug">
ProbBase(probType="ad", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAD",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "门店id",
            dataIndex: "shop_id",
            width: 90,
          },
          {
            title: "门店",
            dataIndex: "shop_name",
            width: 250,
          },
          {
            title: "packName",
            dataIndex: "packName",
            width: 150,
          },
          {
            title: "示例单号",
            dataIndex: "示例单号",
            width: 250,
          },
          {
            title: "用户支付配送费",
            dataIndex: "用户支付配送费",
            align: "right",
            width: 130,
            _sort: true,
          },
          {
            title: "商家支付配送费",
            dataIndex: "商家支付配送费",
            align: "right",
            width: 100,
            _sort: true,
          },
        ],
      };
    },
  };
</script>
