<template lang="pug">
div
  a-table.ant-table-change(:columns="columns" :data-source="table" rowKey="key" :loading="loading" 
    :pagination="{showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small'}" 
    size="small" :scroll="{y: scrollY}" :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)")

    template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
      table-select(:style="`min-width: 160px; width: ${column.width + 50 || 350}px;`" :filterOptions="getColFilters(column.dataIndex)" 
        :selectedList="selectedKeys" @select-change="setSelectedKeys" @confirm="confirm" @reset="clearFilters")

    template(#balances="{text, record}")
      div(v-html="renderBalances(text)")

    template(#handle="{text, record}")
      a-input(:value="text" @change="e => handleChange(e.target.value, record)" size="small")

  .day-slider(v-show="!loading")
    div(style="margin-right: 8px; font-size: 10px;") 变化天数
    a-slider(v-model:value="day" :min="1" :max="10" style="width: 160px;")
</template>

<script>
  import Probs from "../../api/probs";
  import { message } from "ant-design-vue";
  import TableSelect from "../../components/TableSelect";

  export default {
    name: "ProbAH",
    components: {
      TableSelect,
    },
    data() {
      return {
        table: [],
        loading: false,
        scrollY: 900,
        debounce_save: null,
        debounce_fetch: null,
        day: 2,
      };
    },
    computed: {
      columns() {
        return [
          {
            title: "店铺id",
            dataIndex: "shop_id",
            width: 110,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.shop_id == value,
          },
          {
            title: "店铺名称",
            dataIndex: "shop_name",
            width: 250,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.shop_name ?? "") == value,
          },
          {
            title: "平台",
            dataIndex: "platform",
            width: 70,
            filters: [
              { text: "美团", value: "美团" },
              { text: "饿了么", value: "饿了么" },
            ],
            filterMultiple: true,
            onFilter: (value, record) => record.platform == value,
          },
          {
            title: "物理店",
            dataIndex: "real_shop_name",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.real_shop_name ?? "") == value,
          },
          {
            title: "责任人",
            dataIndex: "person",
            width: 80,
            slots: { filterDropdown: "filterDropdown", customRender: "person" },
            onFilter: (value, record) => (record.person ?? "") == value,
          },
          {
            title: "组长",
            dataIndex: "leader",
            width: 80,
            slots: { filterDropdown: "filterDropdown", customRender: "person" },
            onFilter: (value, record) => (record.leader ?? "") == value,
          },
          {
            title: "新店责任人",
            dataIndex: "new_person",
            width: 110,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.new_person ?? "") == value,
          },
          {
            title: "余额变化",
            dataIndex: "balances",
            slots: { customRender: "balances" },
          },
          {
            title: "处理",
            dataIndex: "handle",
            filters: [
              { text: "已处理", value: "" },
              { text: "未处理", value: "1" },
            ],
            filterMultiple: true,
            slots: { customRender: "handle" },
            onFilter: (value, record) =>
              (record?.handle == null) == Boolean(value),
          },
        ];
      },
    },
    methods: {
      getColFilters(colName) {
        return Array.from(new Set(this.table.map((row) => row[colName] ?? "")))
          .sort()
          .map((col) => ({
            label: col,
            value: col,
          }));
      },
      toNum(str) {
        try {
          return parseFloat(str);
        } catch (error) {
          return 0;
        }
      },
      fetchTable() {
        this.loading = true;
        new Probs()
          .single(`ah/${this.day - 1}`)
          .then((res) => {
            this.table = res;
            this.loading = false;
          })
          .catch((err) => {
            message.error(err);
            this.loading = false;
          });
      },
      debounce(fn) {
        let timeout = null;
        return function () {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn.apply(this, arguments), 800);
        };
      },
      handleChange(value, record) {
        const target = this.table.filter((item) => record.key === item.key)[0];
        if (target) {
          target["handle"] = value;
          this.debounce_save(record);
        }
      },
      save(record) {
        const target = this.table.filter((item) => record.key === item.key)[0];
        if (target) {
          new Probs()
            .save("ah", record.key, target["handle"])
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              message.error(err);
            });
        }
      },
      renderBalances(text) {
        if (!text) return text;
        return text
          .split("->")
          .map(parseFloat)
          .map((v, i, a) =>
            v < a[i + 1]
              ? `<span style="text-decoration: underline dotted orange;">${v}</span>`
              : i == a.length - 1 && v > 0 && v < 20
              ? `<span style="text-decoration: underline dotted red;">${v}</span>`
              : `<span>${v}</span>`
          )
          .join("<span>-></span>");
      },
    },
    created() {
      this.scrollY = document.body.clientHeight - 176;
      this.debounce_save = this.debounce(this.save);
      this.debounce_fetch = this.debounce(this.fetchTable);
      this.fetchTable();
    },
    watch: {
      day() {
        this.debounce_fetch();
      },
    },
  };
</script>

<style lang="sass" scoped>
.pre
  white-space: pre-wrap

.day-slider
  display: flex
  align-items: center
  position: absolute
  max-height: 40px
  bottom: 0px
  left: 10px
  z-index: 100
</style>
