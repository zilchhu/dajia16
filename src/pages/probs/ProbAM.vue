<template lang="pug">
ProbBase(probType="am", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAM",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "店铺id",
            dataIndex: "wmpoiid",
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
          //   title: "新店责任人",
          //   dataIndex: "new_person",
          //   width: 110,
          //   slots: { filterDropdown: "filterDropdown" },
          //   onFilter: (value, record) => (record.new_person ?? "") == value,
          // },
          {
            title: "起送价",
            dataIndex: "minPrice",
            width: 150,
            _sort: true
          },
          {
            title: "前一天起送价",
            dataIndex: "lastMinPrice",
            width: 150,
            _sort: true
          },
          {
            title: "查询日期",
            dataIndex: "date",
            width: 120,
            _sort: true,
            _filter: true
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
