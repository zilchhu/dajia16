<template lang="pug">
.tool-act-view
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

  export default {
    name: "tools-act-view",
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
      extendColumn(col) {
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
      },
      buildMtCollectCouponColumns() {
        let columns = [
          {
            title: "门店ID",
            dataIndex: "门店ID",
            width: 140,
          },
          {
            title: "门店名称",
            dataIndex: "门店名称",
            width: 220,
          },
          {
            title: "使用门槛",
            dataIndex: "使用门槛",
            width: 140,
            _sort: true,
            _filter: true,
          },
          {
            title: "优惠券金额",
            dataIndex: "优惠券金额",
            width: 140,
            _sort: true,
            _filter: true,
          },
          {
            title: "使用有效期",
            dataIndex: "使用有效期",
            width: 140,
            _sort: true,
            _filter: true,
          },
          {
            title: "删除活动",
            dataIndex: "删除活动",
            width: 100,
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
        return columns.map(this.extendColumn);
      },
      buildMtPoiInnerCouponColumns() {
        let columns = [
          {
            title: "门店ID",
            dataIndex: "门店ID",
            width: 140,
          },
          {
            title: "门店名称",
            dataIndex: "门店名称",
            width: 220,
          },
          {
            title: "使用门槛",
            dataIndex: "使用门槛",
            width: 140,
            _sort: true,
            _filter: true,
          },
          {
            title: "优惠券金额",
            dataIndex: "优惠券金额",
            width: 140,
            _sort: true,
            _filter: true,
          },
          {
            title: "使用有效期",
            dataIndex: "使用有效期",
            width: 140,
            _sort: true,
            _filter: true,
          },
          {
            title: "删除活动",
            dataIndex: "删除活动",
            width: 100,
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
        return columns.map(this.extendColumn);
      },
      buildMtSealFDCouponColumns() {
        let columns = [
          {
            title: "门店ID",
            dataIndex: "门店ID",
            width: 140,
          },
          {
            title: "门店名称",
            dataIndex: "门店名称",
            width: 220,
          },
          {
            title: "删除活动",
            dataIndex: "删除活动",
            width: 100,
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
        return columns.map(this.extendColumn);
      },
      buildMtOrderCouponColumns() {
        let columns = [
          {
            title: "门店ID",
            dataIndex: "门店ID",
            width: 140,
          },
          {
            title: "门店名称",
            dataIndex: "门店名称",
            width: 220,
          },
          {
            title: "满?元可用",
            dataIndex: "满?元可用",
            width: 140,
            _sort: true,
            _filter: true,
          },
          {
            title: "订单满?元返券",
            dataIndex: "订单满?元返券",
            width: 140,
            _sort: true,
            _filter: true,
          },
          {
            title: "优惠券金额",
            dataIndex: "优惠券金额",
            width: 140,
            _sort: true,
            _filter: true,
          },
          {
            title: "使用有效期",
            dataIndex: "使用有效期",
            width: 140,
            _sort: true,
            _filter: true,
          },
          {
            title: "删除活动",
            dataIndex: "删除活动",
            width: 100,
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
        return columns.map(this.extendColumn);
      },
      buildMtDeliveryDiscountColumns() {
        let columns = [
          {
            title: "门店ID",
            dataIndex: "门店ID",
            width: 140,
          },
          {
            title: "门店名称",
            dataIndex: "门店名称",
            width: 220,
          },
          {
            title: "减配送费",
            dataIndex: "减配送费",
            width: 260,
            _sort: true,
            _filter: true,
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
        return columns.map(this.extendColumn);
      },
      buildMtFullDiscountColumns() {
        let columns = [
          {
            title: "门店ID",
            dataIndex: "门店ID",
            width: 140,
          },
          {
            title: "门店名称",
            dataIndex: "门店名称",
            width: 220,
          },
          {
            title: "满减",
            dataIndex: "满减",
            width: 260,
            _sort: true,
            _filter: true,
          },
          {
            title: "删除活动",
            dataIndex: "删除活动",
            width: 100,
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
        return columns.map(this.extendColumn);
      },
      buildColumns() {
        if (this.taskType == "修改美团收藏有礼")
          this.columns = this.buildMtCollectCouponColumns();
        else if (this.taskType == "修改美团店内领券")
          this.columns = this.buildMtPoiInnerCouponColumns();
        else if (this.taskType == "删除美团售卖代金券")
          this.columns = this.buildMtSealFDCouponColumns();
        else if (this.taskType == "修改美团下单返券")
          this.columns = this.buildMtOrderCouponColumns();
        else if (this.taskType == "修改美团满减活动")
          this.columns = this.buildMtFullDiscountColumns();
        else if (this.taskType == "修改美团减配送费")
          this.columns = this.buildMtDeliveryDiscountColumns();
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
          app.run("ws2://", "get-act-task-inputs", {
            id: this.taskId,
          });
        } else if (this.viewType == "results") {
          app.run("ws2://", "get-act-task-results", {
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
        this.resultBufs = [];

        updTableRow(state, newTable);

        this.table = newTable;
      },
      onGetActTaskInputs(state) {
        if (state.error) message.error(state.error);
        if (this.viewType == "inputs") this.table = state.result.inputs;
      },
      onGetActTaskResults(state) {
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

      app.on("get-act-task-inputs-res", this.onGetActTaskInputs);
      app.on("get-act-task-results-res", this.onGetActTaskResults);
      app.on("exec-act-task-res", this.onExecTask);

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
      app.off("get-act-task-inputs-res", this.onGetActTaskInputs);
      app.off("get-act-task-results-res", this.onGetActTaskResults);
      app.off("exec-act-task-res", this.onExecTask);
    },
  };
</script>


<style lang="sass" scoped>
.tools-act-view
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