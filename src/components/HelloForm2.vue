<template lang="pug">
a-table(
  v-if="data && data.length > 0",
  :columns="columns",
  :data-source="data",
  rowKey="q",
  :showHeader="false",
  :scroll={ x: scrollX },
  :pagination="false",
  size="small"
)
  template(#bodyCell="{ column, text, record }")
    template(v-if="column.dataIndex == 'name'")
      a-input(
        :value="text",
        @change="(e) => handleChange(e.target.value, record, 'name')"
      )
    template(v-else-if="column.dataIndex == 'a'")
      a-textarea(
        :value="text",
        @change="(e) => handleChange(e.target.value, record, 'a')",
        :autoSize="{ minRows: 1 }"
      )
    template(v-else-if="column.dataIndex == 'time'")
      a-spin(:spinning="saving", size="small") 
        span {{ text }}
</template>

<script>
  import dayjs from "dayjs";
  import { updateTableById } from "../api";
  import { message } from "ant-design-vue";
  // import app from "apprun";

  const columns = [
    {
      title: "问题",
      dataIndex: "q",
      width: 140,
    },
    {
      title: "姓名",
      dataIndex: "name",
      width: 140,
    },
    {
      title: "优化",
      dataIndex: "a",
      width: 580,
    },
    {
      title: "时间",
      dataIndex: "time",
    },
  ];

  export default {
    name: "hello-form2",
    props: {
      record: Object,
    },
    data() {
      const data = this.record.a
        ? JSON.parse(this.record.a)
        : this.unSatisfiesProblems(this.record)
            .map((v) => ({
              q: v,
              name: this.record.person,
              a: "",
              operation: "save",
              time: "",
            }))
            .concat([
              {
                q: "自定义",
                name: this.record.person,
                a: "",
                operation: "save",
                time: "",
              },
              {
                q: "发现问题",
                name: this.record.person,
                a: "",
                operation: "save",
                time: "",
              },
              {
                q: "解决问题",
                name: this.record.person,
                a: "",
                operation: "save",
                time: "",
              },
              {
                q: "举一反三",
                name: this.record.person,
                a: "",
                operation: "save",
                time: "",
              },
            ]);
      return {
        data,
        columns,
        saving: false,
        debounce_save: null,
        yesterday: dayjs().subtract(1, "day").format("YYYYMMDD"),
      };
    },
    computed: {
      scrollX() {
        return this.columns.reduce((sum, { width }) => sum + width, 50);
      },
      isYesterday() {
        return this.record.date == this.yesterday;
      },
    },
    methods: {
      handleChange(value, record, column) {
        // if (/^\s+$/.test(value)) return;
        const newData = [...this.data];
        const target = newData.filter((item) => record.q === item.q)[0];
        if (target) {
          target[column] = value;
          this.data = newData;
          this.debounce_save(record);
        }
      },
      save(record) {
        const newData = [...this.data];
        const target = newData.filter((item) => record.q === item.q)[0];

        // if (this.record.date != dayjs().subtract(1, "day").format("YYYYMMDD")) {
        //   message.error("请刷新后重试");
        //   return;
        // }

        if (target) {
          this.saving = true;
          target["time"] = dayjs().format("YYYY/MM/DD HH:mm:ss");
          let a = JSON.stringify(newData);

          updateTableById(this.record.id, a)
            .then((res) => {
              message.success(res);
              // this.data = newData;
              this.saving = false;
              this.$emit('save', this.record.id, a)
            })
            .catch((err) => {
              message.error(err);
              this.saving = false;
            });

          // app.run("ws://", "@record", { ...record, ...target });
        }
      },
      toNum(str) {
        try {
          return parseFloat(str);
        } catch (error) {
          return 0;
        }
      },
      isIncome(text, record) {
        text = this.toNum(text);
        if (record.platform == "美团") return text < 900;
        else if (record.platform == "饿了么") return text < 700;
        return false;
      },
      isIncomeAvg(text) {
        text = this.toNum(text);
        return text < 1500;
      },
      isConsumeRatio(text, record) {
        text = this.toNum(text);
        return text > 6 && record.income > 300;
      },
      isCostRatio(text) {
        text = this.toNum(text);
        return text > 53;
      },
      isSettlea30(text) {
        text = this.toNum(text);
        return text < 80;
      },
      unSatisfies(record) {
        const { income, consume_ratio, cost_ratio, settlea_30, platform } =
          record;
        let list = [];
        if (this.isIncome(income, record))
          list.push({
            title: "收入",
            value: income,
            threshold: platform == "美团" ? "900" : "700",
            problem: "低收入",
          });
        // if (this.isIncomeAvg(income_avg))
        //   list.push({
        //     title: "平均收入",
        //     value: income_avg,
        //     threshold: "1500",
        //     problem: "低收入",
        //   });
        if (this.isConsumeRatio(consume_ratio, record))
          list.push({
            title: "推广比例",
            value: consume_ratio,
            threshold: "6%",
            problem: "高推广",
          });
        if (this.isCostRatio(cost_ratio))
          list.push({
            title: "成本比例",
            value: cost_ratio,
            threshold: "53%",
            problem: "高成本",
          });
        if (this.isSettlea30(settlea_30))
          list.push({
            title: "比30日",
            value: settlea_30,
            threshold: "80%",
            problem: "严重超跌",
          });
        return list;
      },
      unSatisfiesProblems(record) {
        return Array.from(
          new Set(this.unSatisfies(record).map((v) => v.problem))
        );
      },
      debounce(fn) {
        let timeout = null;
        return function () {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn.apply(this, arguments), 600);
        };
      },
    },
    created() {
      this.debounce_save = this.debounce(this.save);
    },
  };
</script>
<style scoped>
  .editable-row-operations a {
    margin-right: 8px;
  }
</style>
