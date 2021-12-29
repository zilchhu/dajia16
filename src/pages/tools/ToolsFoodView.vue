<template lang="pug">
.tool-food-view
  .header(v-if="viewType && viewType != 'plain'")
    div {{ viewType == 'inputs' ? '文件' : '结果' }}

  s-table.ant-table-change(
    :columns="columns",
    :data-source="table",
    rowKey="_i",
    :pagination="false",
    size="small",
    :scroll="{ y: scrollY, x: scrollX }"
  )
    template(
      #customFilterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      table-select(
        :columnTitle="column.title",
        :columnIndex="column.dataIndex",
        :tableData="table",
        @select-change="setSelectedKeys",
        @confirm="confirm()",
        @reset="clearFilters()"
      )
    template(#bodyCell="{ column, text, record }")
      template(v-if="column.dataIndex == '结果'")
        div(style="overflow: hidden", :title="text")
          a-tooltip
            template(#title)
              div(v-if="text == '失败'") {{ record.result.error }}
              .success-res(v-else) {{ getResultDetail(record.result) }}

            a-tag(v-if="text", :color="text == '失败' ? 'error' : 'success'") {{ text }}

  .footer(v-if="viewType && viewType != 'plain'")
    .controls
      a-button(size="small", @click="fetchTable") 刷新
</template>


<script>
  import app from "apprun";
  import { message } from "ant-design-vue";
  import TableSelect from "../../components/TableSelect";

  function throttle(fn, wait) {
    let timer = null;
    return function () {
      let context = this;
      let args = arguments;

      if (!timer) {
        timer = setTimeout(function () {
          fn.apply(context, args);
          timer = null;
        }, wait);
      }
    };
  }

  function extendColumn(col) {
    let _col = {
      ...col,
      customFilterDropdown: true,
      onFilter: (value, record) => (record[col.dataIndex] ?? "") == value,
      showSorterTooltip: false,
    };
    if (col._sort) {
      _col.customFilterDropdown = false;
      _col.sorter = (a, b) =>
        this.toNum(a[col.dataIndex]) - this.toNum(b[col.dataIndex]);
    }
    if (col._notFilter) {
      _col.customFilterDropdown = false;
    }
    if (col._filter) {
      _col.customFilterDropdown = true;
    }
    return _col;
  }

  export default {
    name: "tools-food-view",
    components: {
      TableSelect,
    },
    props: ["plainTable", "viewType", "taskId", "taskType", "scrollY"],
    data() {
      return {
        columns: [],
        table: [],
        resultBufs: [],
        throtUpdateTableRes: () => {},
      };
    },
    computed: {
      scrollX() {
        return this.columns
          .map((col) => col.width ?? 200)
          .reduce((p, v) => p + v, 0);
      },
    },
    methods: {
      toNum(str) {
        try {
          return parseFloat(str);
        } catch (error) {
          return 0;
        }
      },
      buildElmTagColumns() {
        let columns = [
          {
            title: "店铺id",
            dataIndex: "店铺id",
            width: 140,
          },
          {
            title: "分类名称",
            dataIndex: "分类名称",
            width: 140,
          },
          {
            title: "新分类名",
            dataIndex: "新分类名",
            width: 140,
          },
          {
            title: "分类描述",
            dataIndex: "分类描述",
            width: 200,
          },
          {
            title: "开关置顶",
            dataIndex: "开关置顶",
            width: 100,
          },
          {
            title: "置顶时段",
            dataIndex: "置顶时段",
            width: 200,
          },
          {
            title: "分类排序",
            dataIndex: "分类排序",
            width: 100,
            _sort: true,
          },
        ];
        if (this.viewType == "results") {
          columns.push({
            title: "结果",
            dataIndex: "结果",
            width: 80,
            fixed: "right",
          });
        }
        return columns.map(extendColumn);
      },
      buildMtTagColumns() {
        let columns = [
          {
            title: "店铺id",
            dataIndex: "店铺id",
            width: 140,
          },
          {
            title: "分类名称",
            dataIndex: "分类名称",
            width: 140,
          },
          {
            title: "分类id",
            dataIndex: "分类id",
            width: 140,
          },
          {
            title: "新分类名",
            dataIndex: "新分类名",
            width: 140,
          },
          {
            title: "分类描述",
            dataIndex: "分类描述",
            width: 200,
          },
          {
            title: "开关置顶",
            dataIndex: "开关置顶",
            width: 100,
          },
          {
            title: "置顶时段",
            dataIndex: "置顶时段",
            width: 200,
          },
          {
            title: "分类排序",
            dataIndex: "分类排序",
            width: 100,
            _sort: true,
          },
        ];
        if (this.viewType == "results") {
          columns.push({
            title: "结果",
            dataIndex: "结果",
            width: 80,
            fixed: "right",
          });
        }
        return columns.map(extendColumn);
      },
      buildElmFoodColumns() {
        let columns = [
          {
            title: "店铺id",
            dataIndex: "店铺id",
            width: 140,
          },
          {
            title: "分类名称",
            dataIndex: "分类名称",
            width: 140,
          },
          {
            title: "商品名称",
            dataIndex: "商品名称",
            width: 200,
          },
          {
            title: "价格",
            dataIndex: "价格",
            width: 100,
            _sort: true,
          },
          {
            title: "餐盒价格",
            dataIndex: "餐盒价格",
            width: 100,
            _sort: true,
          },
          {
            title: "折扣价格",
            dataIndex: "折扣价格",
            width: 100,
            _sort: true,
          },
          {
            title: "折扣限购",
            dataIndex: "折扣限购",
            width: 100,
            _sort: true,
          },
          {
            title: "最小购买量",
            dataIndex: "最小购买量",
            width: 100,
            _sort: true,
          },
          {
            title: "新商品名",
            dataIndex: "新商品名",
            width: 200,
          },
          {
            title: "删除折扣",
            dataIndex: "删除折扣",
            width: 100,
          },
          {
            title: "删除商品",
            dataIndex: "删除商品",
            width: 100,
          },
        ];
        if (this.viewType == "results") {
          columns.push({
            title: "结果",
            dataIndex: "结果",
            width: 100,
            fixed: "right",
          });
        }
        return columns.map(extendColumn);
      },
      buildMtFoodColumns() {
        let columns = [
          {
            title: "店铺id",
            dataIndex: "店铺id",
            width: 140,
          },
          {
            title: "分类名称",
            dataIndex: "分类名称",
            width: 140,
          },
          {
            title: "商品名称",
            dataIndex: "商品名称",
            width: 200,
          },
          {
            title: "商品id",
            dataIndex: "商品id",
            width: 140,
          },
          {
            title: "数量",
            dataIndex: "数量",
            width: 100,
          },
          {
            title: "数量单位",
            dataIndex: "数量单位",
            width: 100,
          },
          {
            title: "价格",
            dataIndex: "价格",
            width: 100,
            _sort: true,
          },
          {
            title: "餐盒数量",
            dataIndex: "餐盒数量",
            width: 100,
            _sort: true,
          },
          {
            title: "餐盒价格",
            dataIndex: "餐盒价格",
            width: 100,
            _sort: true,
          },
          {
            title: "最小购买量",
            dataIndex: "最小购买量",
            width: 100,
            _sort: true,
          },
          {
            title: "折扣价格",
            dataIndex: "折扣价格",
            width: 100,
            _sort: true,
          },
          {
            title: "折扣限购",
            dataIndex: "折扣限购",
            width: 100,
            _sort: true,
          },
          {
            title: "删除折扣",
            dataIndex: "删除折扣",
            width: 100,
          },
          {
            title: "图片",
            dataIndex: "图片",
            width: 140,
            ellipsis: true,
          },
          {
            title: "属性",
            dataIndex: "属性",
            width: 140,
            ellipsis: true,
          },
          {
            title: "描述",
            dataIndex: "描述",
            width: 140,
            ellipsis: true,
          },
          {
            title: "上下架商品",
            dataIndex: "上下架商品",
            width: 140,
          },
          {
            title: "新商品名",
            dataIndex: "新商品名",
            width: 200,
          },
          {
            title: "删除商品",
            dataIndex: "删除商品",
            width: 100,
          },
        ];
        if (this.viewType == "results") {
          columns.push({
            title: "结果",
            dataIndex: "结果",
            width: 100,
            fixed: "right",
          });
        }
        return columns.map(extendColumn);
      },
      buildMtFoodSubColumns() {
        let columns = [
          {
            title: "店铺id",
            dataIndex: "店铺id",
            width: 140,
          },
          {
            title: "分类名称",
            dataIndex: "分类名称",
            width: 140,
          },
          {
            title: "商品名称",
            dataIndex: "商品名称",
            width: 200,
          },
          {
            title: "替换后分类名称",
            dataIndex: "替换后分类名称",
            width: 140,
          },
          {
            title: "替换后商品名称",
            dataIndex: "替换后商品名称",
            width: 200,
          },
        ];
        if (this.viewType == "results") {
          columns.push({
            title: "结果",
            dataIndex: "结果",
            width: 100,
            fixed: "right",
          });
        }
        return columns.map(extendColumn);
      },
      buildColumns() {
        if (this.taskType == "修改饿了么外卖分类")
          this.columns = this.buildElmTagColumns();
        else if (this.taskType == "修改美团外卖分类")
          this.columns = this.buildMtTagColumns();
        else if (this.taskType == "修改饿了么外卖商品")
          this.columns = this.buildElmFoodColumns();
        else if (this.taskType == "修改美团外卖商品")
          this.columns = this.buildMtFoodColumns();
        else if (this.taskType == "替换美团外卖商品")
          this.columns = this.buildMtFoodSubColumns();
      },
      getResultDetail(result) {
        if (result.result == null) return "";
        return JSON.stringify(result.result, null, 2);
      },
      fetchTable() {
        if (this.taskId == null) {
          this.table = this.plainTable;
          return;
        }

        if (this.viewType == "inputs") {
          app.run("ws://", "get-food-task-inputs", {
            id: this.taskId,
          });
        } else if (this.viewType == "results") {
          app.run("ws://", "get-food-task-results", {
            id: this.taskId,
          });
        }
      },
      updateTableResult(state) {
        const updTableRow = (state, newTable) => {
          let i = newTable.findIndex((v) => v._i == state._i);
          if (i < 0) return;

          let 结果 = state.error ? "失败" : "成功";
          newTable[i] = { ...newTable[i], 结果, result: state };
        };

        if (this.viewType != "results") return;
        if (state.id != this.taskId) return;

        console.log("更新");

        let newTable = [...this.table];
        let buffers = this.resultBufs.filter((v) => v.id == this.taskId);

        for (let buf of this.resultBufs) {
          updTableRow(buf, newTable);
        }
        updTableRow(state, newTable);

        this.table = newTable;
      },
      onGetFoodTaskInputs(state) {
        if (state.error) message.error(state.error);
        if (this.viewType == "inputs") this.table = state.result.inputs;
      },
      onGetFoodTaskResults(state) {
        if (state.error) message.error(state.error);
        if (this.viewType == "results") this.table = state.result.results;
      },
      onExecTask(state) {
        console.log("res -->", state);
        this.resultBufs.push(state);
        this.throtUpdateTableRes(state);
      },
    },
    created() {
      this.throtUpdateTableRes = throttle(this.updateTableResult, 800);

      app.on("get-food-task-inputs-res", this.onGetFoodTaskInputs);
      app.on("get-food-task-results-res", this.onGetFoodTaskResults);
      app.on("exec-task-res", this.onExecTask);

      this.buildColumns();
      this.fetchTable();
    },
    watch: {
      taskType() {
        this.buildColumns();
      },
      taskId() {
        this.resultBufs = [];
        this.fetchTable();
      },
      viewType() {
        this.buildColumns();
        this.fetchTable();
      },
      plainTable() {
        this.fetchTable();
      },
    },
    unmounted() {
      console.log("tools-food-file unmounted!");
      app.off("get-food-task-inputs-res", this.onGetFoodTaskInputs);
      app.off("get-food-task-results-res", this.onGetFoodTaskResults);
      app.off("exec-task-res", this.onExecTask);
    },
  };
</script>


<style lang="sass" scoped>
.tools-food-view
  padding: 8px

.header
  display: flex
  justify-content: space-between
  align-items: center
  height: 40px

.controls
  display: flex
  align-items: center
  column-gap: 6px

.success-res
  max-width: 300px
  max-height: 200px
  overflow: auto
  white-space: pre-wrap

.footer
  margin-top: 12px
</style>