<template lang="pug">
ProbBase(probType="al", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAL",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
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
            title: "平台",
            dataIndex: "platform",
            width: 70,
          },
          {
            title: "物理店",
            dataIndex: "real_shop_name",
            width: 100,
          },
          {
            title: "责任人",
            dataIndex: "person",
            width: 80,
          },
          // {
          //   title: "组长",
          //   dataIndex: "组长",
          //   width: 80,
          //   slots: { filterDropdown: "filterDropdown", customRender: "person" },
          //   onFilter: (value, record) => (record.组长 ?? "") == value,
          // },
          // {
          //   title: "新店责任人",
          //   dataIndex: "新店责任人",
          //   width: 110,
          //   slots: { filterDropdown: "filterDropdown" },
          //   onFilter: (value, record) => (record.新店责任人 ?? "") == value,
          // },
          {
            title: "商品",
            dataIndex: "itemName",
          },
          {
            title: "原价",
            dataIndex: "actInfo",
            width: 100,
            _sort: true,
          },
          {
            title: "折扣价",
            dataIndex: "actPrice",
            width: 100,
            _sort: true,
          },
          {
            title: "限购数量",
            dataIndex: "orderLimit",
            width: 100,
            _sort: true,
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
