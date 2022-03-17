<template lang="pug">
ProbBase(probType="w", :columns="columns", :xScroll="true")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbW",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "责任人",
            dataIndex: "责任人",
            width: 80,
          },
          {
            title: "店铺ID",
            dataIndex: "店铺ID",
            width: 90,
          },
          {
            title: "店铺名称",
            dataIndex: "店铺名称",
            width: 250,
          },
          {
            title: "平台",
            dataIndex: "平台",
            width: 70,
          },
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 90,
          },
          {
            title: "门店起送",
            dataIndex: "门店起送",
            width: 100,
            _sort: true,
            _filter: true,
          },
          {
            title: "分类名称",
            dataIndex: "分类名称",
            width: 140,
          },
          {
            title: "商品名称",
            dataIndex: "商品名称",
            width: 250,
          },
          {
            title: "原价",
            dataIndex: "原价",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "餐盒费",
            dataIndex: "餐盒费",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "起购数量",
            dataIndex: "起购数量",
            align: "right",
            width: 100,
            _sort: true,
            _filter: true,
          },
          {
            title: "折扣价",
            dataIndex: "折扣价",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "折扣限购",
            dataIndex: "折扣限购",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "加购原价",
            dataIndex: "加购原价",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "处理",
            dataIndex: "handle",
            width: 160,
          },
        ],
      };
    },
  };
</script>
