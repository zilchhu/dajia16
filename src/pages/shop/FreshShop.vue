<template lang="pug">
div
  a-table.ant-table-change.ant-table-fresh(
    :columns="fresh_shop_columns",
    :data-source="fresh_shop_data.shops",
    rowKey="key",
    :loading="spinning",
    :pagination="{ showSizeChanger: true, defaultPageSize, pageSizeOptions: ['19', '38', '76', '152'], size: 'small' }",
    size="small",
    :scroll="{ x: scrollX, y: scrollY }",
    bordered,
    :style="`max-width: ${scrollX + 10}px;`",
    :rowClassName="(record) => (record.field == '评论数' ? 'table-striped' : null)"
  )
    template(
      #customFilterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      table-select(
        :columnTitle="column.title",
        :columnIndex="column.dataIndex",
        :tableData="fresh_shop_data.shops",
        @select-change="setSelectedKeys",
        @confirm="confirm()",
        @reset="clearFilters()"
      )
    template(#bodyCell="{ column, text, record }")
      template(v-if="fresh_shop_data.dates.includes(column.dataIndex)")
        div(v-if="record.field == '优化'")
          div(v-if="text?.isYesterday") 
            a-popover(color="cyan")
              template(#content)
                a-textarea(
                  :defaultValue="text?.a2",
                  :autoSize="{ minRows: 12 }",
                  style="min-width: 500px",
                  @change="(e) => handleChange(e, text, record.wmPoiId)"
                )
              .truncate(style="width: 100%") {{ isEmpty(text?.a2) ? '-' : text?.a2 }}
          div(v-else)
            a-tooltip(color="cyan")
              template(#title)
                .pre-wrap {{ text?.a2 }}
              .truncate(style="width: 100%") {{ text?.a2 }}
        .cell(v-else, :class="{ unsatisfied: isUnsatisfy(record, text) }") {{ text }}
      template(v-else-if="column.dataIndex == 'field'")
        .cell.pointer(
          :title="record.name",
          @click="() => showChartModal(record)"
        ) {{ text }}

  a-modal(
    v-model:visible="probClickModal",
    :footer="null",
    centered,
    :width="1080"
  )
    shop-problem(:shop_meta="shop_meta")

  a-modal(
    v-model:visible="ratesClickModal",
    :footer="null",
    centered,
    :width="800"
  )
    shop-indices(:shop_meta="shop_meta_rates")

  a-modal(
    v-model:visible="offsellClickModal",
    :footer="null",
    centered,
    :width="1080"
  )
    shop-offsell(:goods_meta="shop_meta_offsells")

  a-modal(
    v-model:visible="isChartModalVis",
    :footer="null",
    centered,
    :width="800",
    forceRender
  )
    v-chart.chart(:option="option")

  .left-bottom-div(v-show="!spinning")
    a-button(type="link", size="small", @click="fetch_fresh_shop") refresh
    a(:href="`http://192.168.3.3:9040/新店表${yesterday}.xlsx`", target="_blank") export
</template>

<script>
  import dayjs from "dayjs";
  import localeData from "dayjs/plugin/localeData";
  import weekday from "dayjs/plugin/weekday";
  import updateLocale from "dayjs/plugin/updateLocale";
  import { message } from "ant-design-vue";
  import FreshShop from "../../api/fresh-shop";
  import ShopProblem from "../../components/shop/ShopProblem";
  import ShopIndices from "../../components/shop/ShopIndices";
  import ShopOffsell from "../../components/shop/ShopOffsell";
  import TableSelect from "../../components/TableSelect";
  import { SaveOutlined } from "@ant-design/icons-vue";

  import "dayjs/locale/zh-cn";

  dayjs.extend(localeData);
  dayjs.extend(weekday);
  dayjs.extend(updateLocale);

  dayjs.locale("zh-cn");

  dayjs.updateLocale("zh-cn", {
    weekdays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
  });

  export default {
    name: "fresh-shop",
    components: {
      ShopProblem,
      ShopIndices,
      ShopOffsell,
      TableSelect,
      SaveOutlined,
    },
    data() {
      return {
        fresh_shop_data: {
          dates: [],
          shops: [],
        },
        fresh_as_data: [],
        fresh_as: [],
        aModel: false,
        spinning: false,
        scrollY: 900,
        debounce_save: null,
        defaultPageSize: 19,
        last_fresh_shop_route: { path: "/freshshop" },
        probClickModal: false,
        ratesClickModal: false,
        offsellClickModal: false,
        isChartModalVis: false,
        shop_meta: { shopId: null, platform: null },
        shop_meta_rates: { shopId: null, platform: null },
        shop_meta_offsells: { shopId: null, platform: null, day: null },
        today: dayjs().format("YYYY-MM-DD"),
        myChart: null,
        chartBaseOpt: {
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
          },
          // toolbox: {
          //   show: true,
          //   orient: "horizontal",
          //   color: ["#1e1eff"],
          //   feature: {
          //     mark: { show: true },
          //     magicType: { show: true, type: ["line", "bar", "stack", "tiled"] },
          //     restore: { show: true },
          //     saveAsImage: { show: true },
          //   },
          // },
          calculable: true,
          // dataZoom: {
          //   type: "inside",
          //   xAxisIndex: [0],
          // },
          // legend: {
          //   orient: "vertical",
          //   left: "right",
          //   top: "middle",
          //   itemGap: 20,
          // },
          yAxis: {
            type: "value",
            splitNumber: 10,
          },
        },
        option: {},
      };
    },
    computed: {
      yesterday() {
        return dayjs().subtract(1, "day").format("YYYYMMDD");
      },
      fresh_shop_columns() {
        let fiexed_cols = [
          {
            title: "物理店",
            dataIndex: "real_shop_name",
            width: 70,
            fixed: "left",
            customRender: ({ text, record, index }) => {
              const obj = {
                children: (
                  <div style="writing-mode: vertical-lr; white-space: pre-wrap; color: rgba(0,0,0,.65);">
                    {text}
                  </div>
                ),
                props: {},
              };
              if (index % 19 == 0) {
                obj.props.rowSpan = 19;
              } else {
                obj.props.rowSpan = 0;
              }
              return obj;
            },
          },
          {
            title: "门店",
            dataIndex: "name",
            width: 70,
            fixed: "left",
            customRender: ({ text, record, index }) => {
              const obj = {
                children: (
                  <div style="writing-mode: vertical-lr; white-space: pre-wrap; color: rgba(0,0,0,.65);">
                    {text}
                    <br />
                    {record.wmPoiId}
                  </div>
                ),
                props: {},
              };
              if (index % 19 == 0) {
                obj.props.rowSpan = 19;
              } else {
                obj.props.rowSpan = 0;
              }
              return obj;
            },
          },
          {
            title: "负责人",
            dataIndex: "person",
            width: 70,
            fixed: "left",
            customRender: ({ text, record, index }) => {
              const obj = {
                children: (
                  <div
                    onclick={() =>
                      this.$router.push({
                        name: "user",
                        params: { username: record.person, date: 0 },
                      })
                    }
                    style="writing-mode: vertical-lr; white-space: pre-wrap; color: rgba(0,0,0,.65);"
                  >
                    {text}
                  </div>
                ),
                props: {},
              };
              if (index % 19 == 0) {
                obj.props.rowSpan = 19;
              } else {
                obj.props.rowSpan = 0;
              }
              return obj;
            },
          },
          {
            title: "组长",
            dataIndex: "leader",
            width: 70,
            fixed: "left",
            customRender: ({ text, record, index }) => {
              const obj = {
                children: (
                  <div
                    onclick={() =>
                      this.$router.push({
                        name: "user",
                        params: { username: record.leader, date: 0 },
                      })
                    }
                    style="writing-mode: vertical-lr; white-space: pre-wrap; color: rgba(0,0,0,.65);"
                  >
                    {text}
                  </div>
                ),
                props: {},
              };
              if (index % 19 == 0) {
                obj.props.rowSpan = 19;
              } else {
                obj.props.rowSpan = 0;
              }
              return obj;
            },
          },
          {
            title: "项目",
            dataIndex: "field",
            width: 70,
            fixed: "left",
          },
        ];
        let dates_cols = this.fresh_shop_data.dates.map((v) => ({
          title: dayjs(v, "YYYYMMDD").format("M/D"),
          dataIndex: v,
          align: "right",
          width: 70,
          _notFilter: true,
        }));
        // console.log([...fiexed_cols, ...dates_cols])
        return [...fiexed_cols, ...dates_cols].map(this.extendColumn);
      },
      fresh_as_columns() {
        return [
          {
            title: "优化记录",
            dataIndex: "a2",
            width: 700,
            slots: { customRender: "a2" },
          },
          {
            title: "日期",
            dataIndex: "updated_at",
            width: 100,
          },
        ];
      },
      scrollX() {
        let x = this.reduce_width(this.fresh_shop_columns);
        return x;
      },
    },
    methods: {
      reduce_width(nodes) {
        return nodes.reduce((sw, c) => {
          if (c.width) return sw + c.width ?? 200;
          if (c.children) return sw + this.reduce_width(c.children);
          return sw;
        }, 10);
      },
      isEmpty(val) {
        if (val == null) return true;
        if (val == "") return true;
        if (/^\s$/.test(val)) return true;
        return false;
      },
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
          let sortByNum = (a, b) => {
            if (a == null) return b == null ? 0 : -1;
            return this.toNum(a[col.dataIndex]) - this.toNum(b[col.dataIndex]);
          };
          let sortByStr = (a, b) => {
            if (a == null) return b == null ? 0 : -1;
            return a[col.dataIndex].localeCompare(b[col.dataIndex]);
          };
          _col.sorter = col._sort == "str" ? sortByStr : sortByNum;
        }
        if (col._notFilter) {
          _col.customFilterDropdown = false;
        }
        if (col._filter) {
          _col.customFilterDropdown = true;
        }
        return _col;
      },
      debounce(fn) {
        let timeout = null;
        return function () {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn.apply(this, arguments), 800);
        };
      },
      getColFilters(colName) {
        return Array.from(
          new Set(this.fresh_shop_data.shops.map((row) => row[colName] || ""))
        )
          .sort()
          .map((col) => ({
            label: col,
            value: col,
          }));
      },
      fetch_fresh_shop() {
        this.spinning = true;
        new FreshShop()
          .single()
          .then((res) => {
            this.fresh_shop_data = res;
            this.spinning = false;
          })
          .catch((e) => {
            console.error(e);
            message.error(e);
            this.spinning = false;
          });
      },
      fetch_fresh_as() {
        this.spinning = true;
        new FreshShop()
          .getAs()
          .then((res) => {
            this.fresh_as_data = res;
            this.spinning = false;
          })
          .catch((e) => {
            console.error(e);
            message.error(e);
            this.spinning = false;
          });
      },
      isUnsatisfy(record, text) {
        if (record.field == "评论数") return this.toNum(text) < 20;
        if (record.field == "评分") return this.toNum(text) < 4.8;
        if (record.field == "推广")
          return this.toNum(text) < 50 || this.toNum(text) > 150;
        if (record.field == "客单价") return this.toNum(text) < 12;
        if (record.field == "曝光量") return this.toNum(text) < 3000;
        if (record.field == "进店率") return this.toNum(text) < 8;
        if (record.field == "下单率") return this.toNum(text) < 25;
        if (record.field == "下架产品量") return this.toNum(text) > 5;
        if (record.field == "下架产品量") return this.toNum(text) > 5;
        if (record.field == "商圈排名") return this.toNum(text) > 2;
        if (record.field == "高佣返现")
          return this.toNum(text) == 0 && record.platform == "美团";
        if (record.field == "延迟发单")
          return this.toNum(text) == 0 && record.platform == "饿了么";
        if (record.field == "评论/单量") return this.toNum(text) < 20;
        if (record.field == "成本比例") return this.toNum(text) > 50;
      },
      handleChange(e, text, wmPoiId) {
        console.log(e.target.value, text, wmPoiId);
        const i = this.fresh_shop_data.shops.findIndex(
          (v) => v.wmPoiId == wmPoiId && v.field == "优化"
        );
        if (i > -1) {
          this.fresh_shop_data.shops[i][text.date].a2 = e.target.value;
        }
        this.debounce_save(wmPoiId, e.target.value);
      },
      save(wmpoiid, value) {
        new FreshShop()
          .saveA(wmpoiid, value, dayjs().format("YYYY-MM-DD"))
          .then((res) => {
            console.log(res);
            message.success("保存成功");
            // this.fetch_fresh_shop()
          })
          .catch((err) => {
            console.error(err);
            message.error("保存失败");
          });
      },
      handleAModel(record) {
        this.fresh_as = this.fresh_as_data.filter(
          (v) => v.wmpoiid == record.wmPoiId
        );
        this.aModel = true;
      },
      handleAAModel(record) {
        console.log(record);
        let value = document.getElementById(record.key).value;
        this.handleChange(value, record.wmPoiId, this.today);
      },
      showChartModal(record) {
        if (record.field == "优化") return;

        this.option = {
          ...this.chartBaseOpt,
          title: {
            text: record.field,
          },
          xAxis: {
            data: this.fresh_shop_data.dates,
          },
          yAxis: {
            type: record.field.startsWith("袋鼠店长") ? "category" : "value",
          },
          series: [
            {
              name: record.field,
              type: "line",
              data: this.fresh_shop_data.dates.map((d) =>
                record.field.startsWith("袋鼠店长")
                  ? record[d]
                  : this.toNum(record[d])
              ),
            },
          ],
        };
        this.isChartModalVis = true;
      },
      costRatioClick(date, record) {
        this.shop_meta = {
          shopId: record.wmPoiId,
          platform: record.platform == "美团" ? "mt" : "elm",
          date: dayjs(date, "YYYYMMDD").add(1, "day").format("YYYYMMDD"),
        };
        this.probClickModal = true;
      },
      ratingClick(record) {
        this.shop_meta_rates = {
          shopId: record.wmPoiId,
          platform: record.platform == "美团" ? "mt" : "elm",
        };
        this.ratesClickModal = true;
      },
      offsellClick(day, record) {
        this.shop_meta_offsells = {
          shopId: record.wmPoiId,
          platform: record.platform == "美团" ? "mt" : "elm",
          day,
        };
        this.offsellClickModal = true;
      },
    },
    created() {
      this.debounce_save = this.debounce(this.save);
      this.fetch_fresh_shop();
      this.fetch_fresh_as();
    },
    mounted() {
      this.scrollY = document.body.clientHeight - 164;
    },
    watch: {
      $route(route) {
        if (route.name == "fresh-shop") {
          if (route.path != this.last_fresh_shop_route.path) {
            this.fetch_fresh_shop();
          }
          this.last_fresh_shop_route = route;
        }
      },
    },
  };
</script>

<style lang="sass">
.cell
  display: inline-block
  width: 100%
  text-align: right

.pointer
  cursor: pointer

.unsatisfied
  color: #fa541c

.ant-table-fresh .table-striped
  background-color: #6ed8c750

.expo
  display: block
  position: absolute
  bottom: 40px
  left: 10px
  z-index: 100

.pre-wrap
  white-space: pre-wrap

.chart
  width: 800px
  height: 500px
</style>
