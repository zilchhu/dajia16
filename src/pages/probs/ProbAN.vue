<template lang="pug">
div
  a-table.ant-table-change(:columns="columns" :data-source="table" rowKey="key" :loading="loading" 
    :pagination="{showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small'}" 
    size="small" :scroll="{y: scrollY}" :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)")

    template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
      table-select(:style="`min-width: 160px; width: ${column.width || 220}px;`" :filterOptions="getColFilters(column.dataIndex)" 
        :selectedList="selectedKeys" @select-change="setSelectedKeys" @confirm="confirm" @reset="clearFilters")

    template(#handle="{text, record}")
      a-input(:value="text" @change="e => handleChange(e.target.value, record)" size="small")

    template(#date="{text, record}")
      div.pre-wrap {{text?.replace('T', '\n')?.replace(/\.\d{3}Z/, '')}}

    template(#operation="{text, record}")
      div
        a-button(type="link" size="small" @click="() => editRecord(record)") 编辑

  a-modal(v-model:visible="isAddModalVis" title="添加条目" :footer="null" centered :width="600")
    a-form(ref="addForm" :model="addModel" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }" @submit="handleAddSubmit")
      a-form-item(label="物理店名")
        a-select(v-model:value="addModel.a" show-search @select="(value) => onRealShopSelect(value, 'add')")
          a-select-option(v-for="rs in realShops" :key="rs.real_shop_name" :value="rs.real_shop_name") {{rs.real_shop_name}}
      a-form-item(label="组员")
        a-input(v-model:value="addModel.b")
      a-form-item(label="组长")
        a-input(v-model:value="addModel.c")
      a-form-item(label="门店人数")
        a-input(v-model:value="addModel.d")
      a-form-item(label="老板是否好沟通")
        a-input(v-model:value="addModel.e")
      a-form-item(label="老板的诉求")
        a-textarea(v-model:value="addModel.f")
      a-form-item(label="门店的问题")
        a-textarea(v-model:value="addModel.g")
      a-form-item(:wrapper-col="{ span: 12, offset: 5 }")
        a-button(type="primary" html-type="submit") 提交

  a-modal(v-model:visible="isEditModalVis" title="编辑条目" :footer="null" centered :width="600")
    a-form(ref="editForm" :model="editModel" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }" @submit="handleEditSubmit")
      a-form-item(label="物理店名")
        a-select(v-model:value="editModel.a" show-search @select="(value) => onRealShopSelect(value, 'edit')")
          a-select-option(v-for="rs in realShops" :key="rs.real_shop_name" :value="rs.real_shop_name") {{rs.real_shop_name}}
      a-form-item(label="组员")
        a-input(v-model:value="editModel.b")
      a-form-item(label="组长")
        a-input(v-model:value="editModel.c")
      a-form-item(label="门店人数")
        a-input(v-model:value="editModel.d")
      a-form-item(label="老板是否好沟通")
        a-input(v-model:value="editModel.e")
      a-form-item(label="老板的诉求")
        a-textarea(v-model:value="editModel.f")
      a-form-item(label="门店的问题")
        a-textarea(v-model:value="editModel.g")
      a-form-item(:wrapper-col="{ span: 12, offset: 5 }")
        a-button(type="primary" html-type="submit") 提交

  .left-bottom-div(v-show="!loading")
    a-button(type="link" size="small" @click="addRecord") 新增
    a-button(type="link" size="small" @click="fetchTable") 刷新
    a-button(type="link" size="small" @click="exportTable" :loading="exporting") 导出
    a(v-show="tableUrl" :href="`http://192.168.3.3:9005/${tableUrl}`" target="_blank") 下载
</template>

<script>
  import Probs from "../../api/probs";
  import Shop from "../../api/shop";
  import { message } from "ant-design-vue";
  import TableSelect from "../../components/TableSelect";
  import app from "apprun";

  export default {
    name: "ProbAN",
    components: {
      TableSelect,
    },
    data() {
      return {
        table: [],
        loading: false,
        scrollY: 900,
        debounce_save: null,
        exporting: false,
        tableUrl: null,
        isAddModalVis: false,
        isEditModalVis: false,
        realShops: [],
        addModel: {
          a: "",
          b: "",
          c: "",
          d: "",
          e: "",
          f: "",
          g: "",
        },
        editModel: {
          id: 0,
          a: "",
          b: "",
          c: "",
          d: "",
          e: "",
          f: "",
          g: "",
        },
      };
    },
    computed: {
      columns() {
        // 日期	物理店名	组员	组长	门店人数	老板是否好沟通	老板的诉求	门店的问题
        return [
          {
            title: "物理店名",
            dataIndex: "物理店名",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.物理店名 ?? "") == value,
          },
          {
            title: "组员",
            dataIndex: "组员",
            width: 80,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.组员 ?? "") == value,
          },
          {
            title: "组长",
            dataIndex: "组长",
            width: 80,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.组长 ?? "") == value,
          },
          {
            title: "门店人数",
            dataIndex: "门店人数",
            width: 100,
            sorter: (a, b) => this.toNum(a.门店人数) - this.toNum(b.门店人数),
          },
          {
            title: "老板是否好沟通",
            dataIndex: "老板是否好沟通",
          },
          {
            title: "老板的诉求",
            dataIndex: "老板的诉求",
          },
          {
            title: "门店的问题",
            dataIndex: "门店的问题",
          },
          {
            title: "创建日期",
            dataIndex: "创建日期",
            width: 120,
            slots: { filterDropdown: "filterDropdown", customRender: "date" },
            onFilter: (value, record) => (record.创建日期 ?? "") == value,
          },
          {
            title: "更新日期",
            dataIndex: "更新日期",
            width: 120,
            slots: { filterDropdown: "filterDropdown", customRender: "date" },
            onFilter: (value, record) => (record.更新日期 ?? "") == value,
          },
          {
            title: "操作",
            dataIndex: "key",
            slots: { customRender: "operation" },
          },
        ];
      },
    },
    methods: {
      getColFilters(colName) {
        return Array.from(
          new Set(this.table.map((row) => row[colName] ?? ""))
        ).map((col) => ({
          label: col || "",
          value: col || "",
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
          .single("an")
          .then((res) => {
            this.table = res;
            this.loading = false;
          })
          .catch((err) => {
            message.error(err);
            this.loading = false;
          });
      },
      fetchRealShops() {
        new Shop()
          .real2()
          .then((res) => {
            this.realShops = res;
          })
          .catch((err) => {
            console.error(err);
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
            .save("a", record.key, target["handle"])
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              message.error(err);
            });
        }
      },
      onRealShopSelect(value, mode) {
        const rs = this.realShops.find((v) => v.real_shop_name == value);
        if (!rs) return;
        switch (mode) {
          case "add":
            this.addModel.b = rs.person;
            this.addModel.c = rs.leader;
        }
      },
      addRecord() {
        this.isAddModalVis = true;
      },
      editRecord(record) {
        console.log(record);
        this.editModel = {
          id: record.id,
          a: record.物理店名,
          b: record.组员,
          c: record.组长,
          d: record.门店人数,
          e: record.老板是否好沟通,
          f: record.老板的诉求,
          g: record.门店的问题,
        };
        this.isEditModalVis = true;
      },
      handleAddSubmit() {
        console.log(this.addModel);
        new Probs()
          .addAn(this.addModel)
          .then((res) => {
            message.success(res);
            this.isAddModalVis = false;
            this.fetchTable();
          })
          .catch((err) => {
            message.error(err);
          });
      },
      handleEditSubmit() {
        console.log(this.editModel);
        new Probs()
          .editAn(this.editModel)
          .then((res) => {
            message.success(res);
            this.isEditModalVis = false;
            this.fetchTable();
          })
          .catch((err) => {
            message.error(err);
          });
      },
      onSelectChange(checks) {
        console.log(checks);
      },
      transformTable() {
        return this.table.map((row) =>
          this.columns.reduce(
            (p, c) => ({ ...p, [c.title]: row[c.dataIndex] }),
            {}
          )
        );
      },
      exportTable() {
        this.exporting = true;
        app.run("ws://", "@export-table", {
          json: this.transformTable(),
        });
      },
    },
    created() {
      this.scrollY = document.body.clientHeight - 176;
      this.debounce_save = this.debounce(this.save);
      this.fetchRealShops();
      this.fetchTable();
    },
    mounted() {
      app.on("@export-table", (state) => {
        console.log(state);
        this.exporting = false;
        this.tableUrl = state.path;
      });
    },
  };
</script>
