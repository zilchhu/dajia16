<template lang="pug">
div
  a-table(:columns="tableCols" :data-source="table" rowKey="shop_id" :row-selection="rowSelection" :loading="tableLoading" @expand="expand" :expandRowByClick="true" :expandIconAsCell="false" :expandIconColumnIndex="-1" :pagination="{showSizeChanger: true, defaultPageSize}"
    @change="table_change" size="small" :scroll="{x: scrollX, y: scrollY}" :rowClassName="(record, index) => (record.new_person != null ? 'table-new-person-row' : null)")
    template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
      //- a-row(type="flex")
      //-   a-col(flex="auto")
      //-     a-select(mode="multiple" :value="selectedKeys" @change="setSelectedKeys" :placeholder="`filter ${column.title}`" :style="`min-width: 160px; width: ${column.width}px;`")
      //-       a-select-option(v-for="option in getColFilters(column.dataIndex)" :key="option.value") {{option.value}} 
      //-   a-col(flex="60px")
      //-     a-button(type="link" @click="confirm") confirm
      //-     br
      //-     a-button(type="link" @click="clearFilters") reset
      table-select(:style="`min-width: 160px; width: ${column.width + 50 || 220}px;`" :filterOptions="getColFilters(column.dataIndex)" 
       :selectedList="selectedKeys" @select-change="setSelectedKeys" @confirm="confirm" @reset="clearFilters")

    //- 染色
    template(v-for="col in ruleIdx" #[col]="{text, record}")
      .cell(:class="{unsatisfied: rules2fn[record.platform][col](text)}") {{text}}
    template(#shop_id="{text, record}")
      router-link.cell(:to="{name: 'shop', params: {shopid: text}}" style="color: rgba(0, 0, 0, 0.65);") {{text}}
    template(#person="{text, record}")
      a-tooltip(v-if="record.new_person" :title="`新店 : ${record.new_person}`")
        router-link.cell(:to="{ name: 'user', params: { username: text || '-', date: 0 }}" style="color: rgba(0, 0, 0, 0.65);") {{text}}
      router-link.cell(v-else :to="{ name: 'user', params: { username: text || '-', date: 0 }}" style="color: rgba(0, 0, 0, 0.65);") {{text}}
    template(#cost_ratio="{text, record}")
      .cell(:class="{unsatisfied: rules2fn[record.platform]['cost_ratio'](text)}" @click.stop="() => costRatioClick(text, record)" style="cursor: pointer;") {{text}}
    template(#rating="{text, record}")
      .cell(@click.stop="() => ratingClick(record)" :class="{unsatisfied: text < record.rating_last}" style="cursor: pointer;") {{text}}

    template(#expandedRowRender="{record}")
      a-collapse(v-model:activeKey="collapseKey" :bordered="false")
        a-collapse-panel(:key="`${record.id}-a`" style="border: none;")
          template(#header)
            span.small 昨日
          a-card(style="width: 100vw;" size="small")
            a-tooltip(v-for="key in Object.keys(record).filter(v=>!['a','comments'].includes(v))" :key="key")
              template(#title)
                .tip {{`${record[key]}${thresholdSuffix(key, record.platform)}`}}
              a-card-grid(style="width: 130px; padding: 4px;")
                a-statistic(:title="en2zh.get(key)" :value="record[key]" valueStyle="font-size: 1em;")
                  template(v-if="ruleIdx.includes(key)" #formatter="{value}")
                    p.truncate(:class="{unsatisfied: rules2fn[record.platform][key](value)}") {{emptyVal(value)}}
                    //- template(v-else-if="key == 'score'")
                    //-   p.truncate(:class="{success: value == 100}") {{value}}
                  template(v-else #formatter="{value}")
                    p.truncate {{emptyVal(value)}}
          hello-form2(:record="record" @save="onSave")
        //- a-tab-pane(key="1" tab="1") 1
        a-collapse-panel(:key="`${record.id}-b`" style="border: none;") 
          template(#header)
            span.small 往日
          a-table(:columns="shopTableCols" :data-source="tablesByShop.get(record.shop_id)" rowKey="date" :loading="tablesByShopLoading.has(record.shop_id)" :expandRowByClick="true" :pagination="{showSizeChanger: true, defaultPageSize: 10}" size="small" :scroll="{x: shopScrollX}" style="width: calc(100vw - 80px);")
            //- 染色
            template(v-for="col in ruleIdx" #[col]="{text, record}")
              .cell(:class="{unsatisfied: rules2fn[record.platform][col](text)}") {{text}}

            template(#expandedRowRender="{record}")
              a-tabs(size="small")
                a-tab-pane(:key="`${record.id}`-1" tab="详情" size="small")
                  a-card(size="small")
                    a-tooltip(v-for="key in Object.keys(record).filter(v=>!['a','comments'].includes(v))" :key="key")
                      template(#title)
                        .tip {{`${record[key]}${thresholdSuffix(key, record.platform)}`}}
                      a-card-grid(style="width: 130px; padding: 4px;")
                        a-statistic(:title="en2zh.get(key)" :value="record[key]" valueStyle="font-size: 1em;")
                          template(v-if="ruleIdx.includes(key)" #formatter="{value}")
                            p.truncate(:class="{unsatisfied: rules2fn[record.platform][key](value)}") {{emptyVal(value)}}
                          template(v-else #formatter="{value}")
                            p.truncate {{emptyVal(value)}}
                a-tab-pane(:key="`${record.id}`-2" tab="优化" size="small")
                  hello-form2(:record="record" @save="onSave")
  a-modal(v-model:visible="editRowKeysModal" :footer="null" centered :width="540")
    a-textarea(v-model:value="editedRowKeys" placeholder="导入门店ID（慎用）" :autoSize="{minRows: 10, maxRows: 10}")
    all-shop-form(:shop_metas="selectedShopMetas")

  a-modal(v-model:visible="probClickModal" :footer="null" centered :width="1080")
    shop-problem(:shop_meta="shop_meta")

  a-modal(v-model:visible="ratesClickModal" :footer="null" centered :width="800")
    shop-indices(:shop_meta="shop_meta_rates")
        
  a.expo(:href="`http://192.168.3.3:9040/营推表${yesterday}.xlsx`" target="_blank") export
</template>

<script>
  import { message } from "ant-design-vue";
  import { getTableByDate, getTableByShop } from "../../api";
  import dayjs from "dayjs";
  import HelloForm2 from "../../components/HelloForm2";
  import AllShopForm from "../../components/shop/AllShopForm";
  import ShopProblem from "../../components/shop/ShopProblem";
  import ShopIndices from "../../components/shop/ShopIndices";
  import TableSelect from "../../components/TableSelect";

  function distinct(s) {
    let ns = s.trim().split("\n");
    ns = ns.map((v) => v.trim());
    ns = Array.from(new Set(ns));
    return ns.filter((v) => /\d+/.test(v));
  }

  export default {
    name: "date",
    data() {
      return {
        table: [],
        tablesByShop: new Map(),
        tablesByShopLoading: new Set(),
        tableLoading: false,
        rules: [
          ["income_avg", "<", 1500],
          ["consume_ratio", ">", 5],
          ["cost_ratio", ">", 50],
          ["settlea_30", "<", 70],
        ],
        mtRules: [["income", "<", 1500]],
        elmRules: [["income", "<", 1000]],
        ruleIdx: ["income", "income_avg", "consume_ratio", "settlea_30"],
        collapseKey: [],
        scrollY: 2000,
        selectedRowKeys: [],
        editRowKeysModal: false,
        probClickModal: false,
        ratesClickModal: false,
        editedRowKeys: "",
        defaultPageSize: 30,
        shop_meta: { shopId: null, platform: null },
        shop_meta_rates: { shopId: null, platform: null },
      };
    },
    components: {
      HelloForm2,
      AllShopForm,
      ShopProblem,
      ShopIndices,
      TableSelect,
    },
    computed: {
      tablePersonColFilters() {
        return this.getColFilters("person");
      },
      tableCityColFilters() {
        return this.getColFilters("city");
      },
      tableRealShopColFilters() {
        return this.getColFilters("real_shop");
      },
      tableCols() {
        return [
          {
            title: "城市",
            dataIndex: "city",
            width: 40,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.city == value,
          },
          {
            title: "负责",
            dataIndex: "person",
            width: 60,
            slots: { customRender: "person", filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.person == value,
          },
          {
            title: "组长",
            dataIndex: "leader",
            width: 60,
            slots: { customRender: "person", filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.leader == value,
          },
          {
            title: "物理店",
            dataIndex: "real_shop",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.real_shop == value,
            sorter: (a, b) => (a.real_shop < b.real_shop ? -1 : 1),
          },
          {
            title: "门店id",
            dataIndex: "shop_id",
            width: 90,
            slots: { filterDropdown: "filterDropdown", customRender: "shop_id" },
            onFilter: (value, record) => record.shop_id == value,
          },
          {
            title: "店名",
            dataIndex: "shop_name",
            width: 280,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.shop_name == value,
          },
          {
            title: "平台",
            dataIndex: "platform",
            width: 60,
            filters: [
              { text: "美团", value: "美团" },
              { text: "饿了么", value: "饿了么" },
            ],
            filterMultiple: true,
            onFilter: (value, record) => record.platform == value,
          },
          {
            title: "评分",
            dataIndex: "rating",
            align: "right",
            width: 40,
            slots: { customRender: "rating" },
            sorter: (a, b) => this.toNum(a.rating) - this.toNum(b.rating),
          },
          {
            title: "总收入",
            dataIndex: "income_sum",
            align: "right",
            width: 70,
            sorter: (a, b) => this.toNum(a.income_sum) - this.toNum(b.income_sum),
          },
          {
            title: "平均收入",
            dataIndex: "income_avg",
            align: "right",
            width: 60,
            slots: { customRender: "income_avg" },
            sorter: (a, b) => this.toNum(a.income_avg) - this.toNum(b.income_avg),
          },
          {
            title: "三方配送",
            dataIndex: "third_send",
            align: "right",
            width: 60,
            sorter: (a, b) => this.toNum(a.third_send) - this.toNum(b.third_send),
          },
          {
            title: "订单",
            dataIndex: "orders",
            align: "right",
            width: 60,
            sorter: (a, b) => this.toNum(a.orders) - this.toNum(b.orders),
          },
          {
            title: "收入",
            dataIndex: "income",
            align: "right",
            width: 60,
            slots: { customRender: "income" },
            sorter: (a, b) => this.toNum(a.income) - this.toNum(b.income),
          },

          {
            title: "成本比例",
            dataIndex: "cost_ratio",
            align: "right",
            width: 70,
            slots: { customRender: "cost_ratio" },
            sorter: (a, b) => this.toNum(a.cost_ratio) - this.toNum(b.cost_ratio),
          },
          {
            title: "推广",
            dataIndex: "consume",
            align: "right",
            width: 60,
            sorter: (a, b) => this.toNum(a.consume) - this.toNum(b.consume),
          },
          {
            title: "推广比例",
            dataIndex: "consume_ratio",
            align: "right",
            width: 60,
            slots: { customRender: "consume_ratio" },
            sorter: (a, b) =>
              this.toNum(a.consume_ratio) - this.toNum(b.consume_ratio),
          },
          {
            title: "比30日",
            dataIndex: "settlea_30",
            align: "right",
            width: 70,
            slots: { customRender: "settlea_30" },
            sorter: (a, b) => this.toNum(a.settlea_30) - this.toNum(b.settlea_30),
          },
          {
            title: "比昨日",
            dataIndex: "settlea_1",
            align: "right",
            width: 70,
            sorter: (a, b) => this.toNum(a.settlea_1) - this.toNum(b.settlea_1),
          },
          {
            title: "比上周",
            dataIndex: "settlea_7",
            align: "right",
            width: 70,
            sorter: (a, b) => this.toNum(a.settlea_7) - this.toNum(b.settlea_7),
          },
          {
            title: "总分",
            dataIndex: "score",
            align: "right",
            width: 50,
            sorter: (a, b) => this.toNum(a.score) - this.toNum(b.score),
          },
          {
            title: "日期",
            dataIndex: "date",
            align: "right",
            width: 70,
          },
        ];
      },
      shopTableCols() {
        return [
          {
            title: "总收入",
            dataIndex: "income_sum",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.income_sum) - this.toNum(b.income_sum),
          },
          {
            title: "平均收入",
            dataIndex: "income_avg",
            align: "right",
            width: 100,
            slots: { customRender: "income_avg" },
            sorter: (a, b) => this.toNum(a.income_avg) - this.toNum(b.income_avg),
          },
          {
            title: "三方配送",
            dataIndex: "third_send",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.third_send) - this.toNum(b.third_send),
          },
          {
            title: "订单",
            dataIndex: "orders",
            align: "right",
            width: 80,
            sorter: (a, b) => this.toNum(a.orders) - this.toNum(b.orders),
          },
          {
            title: "收入",
            dataIndex: "income",
            align: "right",
            width: 100,
            slots: { customRender: "income" },
            sorter: (a, b) => this.toNum(a.income) - this.toNum(b.income),
          },
          {
            title: "成本比例",
            dataIndex: "cost_ratio",
            align: "right",
            width: 100,
            slots: { customRender: "cost_ratio" },
            sorter: (a, b) => this.toNum(a.cost_ratio) - this.toNum(b.cost_ratio),
          },
          {
            title: "推广",
            dataIndex: "consume",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.consume) - this.toNum(b.consume),
          },
          {
            title: "推广比例",
            dataIndex: "consume_ratio",
            align: "right",
            width: 100,
            slots: { customRender: "consume_ratio" },
            sorter: (a, b) =>
              this.toNum(a.consume_ratio) - this.toNum(b.consume_ratio),
          },
          {
            title: "比30日",
            dataIndex: "settlea_30",
            align: "right",
            width: 100,
            slots: { customRender: "settlea_30" },
            sorter: (a, b) => this.toNum(a.settlea_30) - this.toNum(b.settlea_30),
          },
          {
            title: "比昨日",
            dataIndex: "settlea_1",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.settlea_1) - this.toNum(b.settlea_1),
          },
          {
            title: "比上周",
            dataIndex: "settlea_7",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.settlea_7) - this.toNum(b.settlea_7),
          },
          {
            title: "总分",
            dataIndex: "score",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.score) - this.toNum(b.score),
          },
          {
            title: "日期",
            dataIndex: "date",
            align: "left",
            sorter: (a, b) => this.toNum(a.date) - this.toNum(b.date),
          },
        ];
      },
      scrollX() {
        return this.tableCols.reduce((sum, { width }) => sum + width + 10, 50);
      },
      shopScrollX() {
        return this.shopTableCols.reduce((sum, { width }) => sum + width, 50);
      },
      en2zh() {
        const map = new Map();
        map.set("id", "id");
        map.set("city", "城市");
        map.set("person", "负责");
        map.set("leader", "组长");
        map.set("real_shop", "物理店");
        map.set("shop_id", "门店id");
        map.set("shop_name", "店名");
        map.set("platform", "平台");
        map.set("rating", "评分");
        map.set("rating_last", "上次评分");
        map.set("third_send", "三方配送");
        map.set("unit_price", "单价");
        map.set("orders", "订单");
        map.set("income", "收入");
        map.set("income_avg", "平均收入");
        map.set("income_sum", "总收入");
        map.set("cost", "成本");
        map.set("cost_avg", "平均成本");
        map.set("cost_sum", "总成本");
        map.set("cost_ratio", "成本比例");
        map.set("cost_sum_ratio", "总成本比例");
        map.set("consume", "推广");
        map.set("consume_avg", "平均推广");
        map.set("consume_sum", "总推广");
        map.set("consume_ratio", "推广比例");
        map.set("consume_sum_ratio", "总推广比例");
        map.set("settlea_30", "比30日");
        map.set("settlea_1", "比昨日");
        map.set("settlea_7", "比上周");
        map.set("settlea_7_3", "比上周(3日)");
        map.set("income_score", "收入分");
        map.set("consume_score", "推广分");
        map.set("cost_score", "成本分");
        map.set("score", "总分");
        map.set("date", "日期");
        return map;
      },
      rules2fn() {
        let mt = [...this.rules, ...this.mtRules];
        let elm = [...this.rules, ...this.elmRules];
        const fnBody = (r) => `
        let v = 0
        try {
          v = parseFloat(val)
        } catch (e) { console.error(e) }
        return v ${r[1]} ${r[2]}`;
        mt = mt.reduce((o, r) => {
          return {
            ...o,
            [r[0]]: new Function("val", fnBody(r)),
          };
        }, {});
        elm = elm.reduce((o, r) => {
          return {
            ...o,
            [r[0]]: new Function("val", fnBody(r)),
          };
        }, {});
        return {
          美团: mt,
          饿了么: elm,
        };
      },
      rowSelection() {
        const { selectedRowKeys } = this;
        return {
          selectedRowKeys,
          onChange: this.onSelectChange,
          hideDefaultSelections: true,
          selections: [
            {
              key: "by id",
              text: "by id",
              onSelect: () => {
                this.editRowKeysModal = true;
              },
            },
          ],
        };
      },
      selectedShopMetas() {
        let r = distinct(this.editedRowKeys);
        r = r
          .map((r) => ({
            id: this.table.find((v) => v.shop_id == r)
              ? this.table.find((v) => v.shop_id == r).id
              : null,
            shop_id: r,
          }))
          .filter((r) => r.id != null);
        return r;
      },
      day() {
        return this.$route.params.day;
      },
      yesterday() {
        return dayjs().subtract(1, "day").format("YYYYMMDD");
      },
    },
    methods: {
      getTableByDate() {
        this.tableLoading = true;
        getTableByDate(this.day)
          .then((res) => {
            this.table = res;
            this.collapseKey = this.table.map((v) => `${v.id}-a`);
            this.tableLoading = false;
          })
          .catch((err) => {
            message.error(err);
            this.tableLoading = false;
          });
      },
      getTableByShop(shopId) {
        this.tablesByShopLoading.add(shopId);
        getTableByShop(shopId)
          .then((res) => {
            this.tablesByShop.set(shopId, res);
            this.tablesByShopLoading.delete(shopId);
          })
          .catch((err) => {
            message.error(err);
            this.tablesByShopLoading.delete(shopId);
          });
      },
      getColFilters(colName) {
        return Array.from(new Set(this.table.map((row) => row[colName] || "")))
          .sort()
          .map((col) => ({ label: col, value: col }));
      },
      expand(expanded, record) {
        if (expanded) {
          this.getTableByShop(record.shop_id);
        }
      },
      onSave(id) {
        console.log(id);
        this.getTableByDate();
      },
      toNum(str) {
        try {
          if (str == null || str == "") return 0;
          return parseFloat(str);
        } catch (error) {
          return 0;
        }
      },
      thresholdSuffix(name, platform) {
        let r =
          platform == "美团"
            ? [...this.rules, ...this.mtRules]
            : [...this.rules, ...this.elmRules];
        let rule = r.find((v) => v[0] == name);
        if (!rule) return "";
        let needPercent = ["consume_ratio", "cost_ratio", "settlea_30"].includes(
          rule[0]
        )
          ? "%"
          : "";
        return ` / ${rule[2]}${needPercent}`;
      },
      emptyVal(val) {
        return val == null || val == undefined ? "-" : val;
      },
      onSelectChange(selectedRowKeys) {
        this.selectedRowKeys = selectedRowKeys;
        this.editedRowKeys = distinct(
          `${this.editRowKeys}\n${this.selectedRowKeys.join("\n")}`
        ).join("\n");
      },
      table_change(pagination) {
        localStorage.setItem("date/defaultPageSize", pagination.pageSize);
      },
      shopid_click(text) {
        this.$router.push({ name: "shop", params: { shopid: text } });
      },
      costRatioClick(_, record) {
        this.shop_meta = {
          shopId: record.shop_id,
          platform: record.platform == "美团" ? "mt" : "elm",
          date: dayjs()
            .subtract(+this.day, "day")
            .format("YYYYMMDD"),
        };
        this.probClickModal = true;
      },
      ratingClick(record) {
        this.shop_meta_rates = {
          shopId: record.shop_id,
          platform: record.platform == "美团" ? "mt" : "elm",
        };
        this.ratesClickModal = true;
      },
    },
    created() {
      this.scrollY = document.body.clientHeight - 140;
      this.defaultPageSize = +localStorage.getItem("date/defaultPageSize") || 30;
      this.getTableByDate();
    },
    watch: {
      $route(route) {
        if (route.name == "date") {
          this.defaultPageSize =
            +localStorage.getItem("date/defaultPageSize") || 30;
          this.getTableByDate();
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

.unsatisfied
  color: #fa541c

.success
  color: #52c41a

.threshold
  color: black

.unsatisfied-row
  border-color: #fff2e8
  background-color: #fff2e8

.satisfied-row
  background-color: #f6ffed

.icon-reset
  margin: 0 6px

.truncate
  width: 110px
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.small
  font-size: .9em

.expo
  display: block
  position: absolute
  bottom: 10px
  left: 10px
  z-index: 100

.ant-table-thead > tr > th
  border: none

.table-new-person-row
  background-color: #6ed8c71a
</style>
