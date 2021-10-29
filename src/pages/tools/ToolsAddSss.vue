<template lang="pug">
div
  a-table.ant-table-change(
    :columns="columns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="{ showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small' }",
    size="small",
    :scroll="{ y: scrollY }",
    :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
  )
    template(
      #filterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      table-select(
        :style="`min-width: 160px; width: ${column.width || 220}px;`",
        :filterOptions="getColFilters(column.dataIndex)",
        :selectedList="selectedKeys",
        @select-change="setSelectedKeys",
        @confirm="confirm",
        @reset="clearFilters"
      )

    template(#handle="{ text, record }")
      a-input(
        :value="text",
        @change="(e) => handleChange(e.target.value, record)",
        size="small"
      )

    template(#date="{ text, record }")
      .pre-wrap {{ text?.replace('T', '\n')?.replace(/\.\d{3}Z/, '') }}

    template(#operation="{ text, record }")
      div
        a-button(type="link", size="small", @click="() => editRecord(record)") 编辑
        a-button(type="link", size="small", @click="() => delRecord(record)") 删除

  a-modal(
    v-model:visible="isAddModalVis",
    title="添加条目",
    :footer="null",
    centered,
    :width="600"
  )
    a-form(
      ref="addForm",
      :model="addModel",
      :label-col="{ span: 5 }",
      :wrapper-col="{ span: 16 }",
      @submit="handleAddSubmit"
    )
      //- a-form-item(label="闪时送ID")
      //-   a-input(v-model:value="addModel.a")
      a-form-item(label="门店ID")
        a-select(
          v-model:value="addModel.c",
          :filterOption="onShopFilter",
          @select="(value) => onShopSelect(value, 'add')",
          show-search
        )
          a-select-option(
            v-for="s in shops",
            :key="s.shop_id",
            :xshop="s",
            :value="s.shop_id"
          ) {{ s.shop_name }}
      a-form-item(label="闪时送名称")
        a-input(v-model:value="addModel.b")
      //- a-form-item(label="闪时送密码")
      //-   a-input(v-model:value="addModel.d")
      a-form-item(:wrapper-col="{ span: 12, offset: 5 }")
        a-button(type="primary", html-type="submit") 提交

  a-modal(
    v-model:visible="isEditModalVis",
    title="编辑条目",
    :footer="null",
    centered,
    :width="600"
  )
    a-form(
      ref="editForm",
      :model="editModel",
      :label-col="{ span: 5 }",
      :wrapper-col="{ span: 16 }",
      @submit="handleEditSubmit"
    )
      //- a-form-item(label="闪时送ID")
      //-   a-input(v-model:value="editModel.a")
      a-form-item(label="门店ID")
        a-select(
          v-model:value="editModel.c",
          show-search,
          :filterOption="onShopFilter"
        )
          a-select-option(
            v-for="s in shops",
            :key="s.shop_id",
            :xshop="s",
            :value="s.shop_id"
          ) {{ s.shop_name }}
      a-form-item(label="闪时送名称")
        a-input(v-model:value="editModel.b")
      //- a-form-item(label="闪时送密码")
      //-   a-input(v-model:value="editModel.d")
      a-form-item(:wrapper-col="{ span: 12, offset: 5 }")
        a-button(type="primary", html-type="submit") 提交

  .left-bottom-div(v-show="!loading", style="bottom: 10px")
    a-button(type="link", size="small", @click="addRecord") 新增
    a-button(type="link", size="small", @click="fetchTable") 刷新
    a-button(
      type="link",
      size="small",
      @click="exportTable",
      :loading="exporting"
    ) 导出
    a(
      v-show="tableUrl",
      :href="`http://192.168.3.3:9005/${tableUrl}`",
      target="_blank"
    ) 下载
</template>

<script>
  import Probs from "../../api/probs";
  import Shop from "../../api/shop";
  import { message } from "ant-design-vue";
  import TableSelect from "../../components/TableSelect";
  import app from "apprun";

  export default {
    name: "tools-add-sss",
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
        shops: [],
        addModel: {
          a: "-",
          b: "",
          c: "",
          d: "-",
        },
        editModel: {
          id: 0,
          a: "-",
          b: "",
          c: "",
          d: "-",
        },
      };
    },
    computed: {
      columns() {
        // 日期	物理店名	组员	组长	门店人数	老板是否好沟通	老板的诉求	门店的问题
        return [
          // {
          //   title: "闪时送ID",
          //   dataIndex: "shs_id",
          //   // width: 90,
          //   slots: { filterDropdown: "filterDropdown" },
          //   onFilter: (value, record) => (record.shs_id ?? "") == value,
          // },
          {
            title: "闪时送名称",
            dataIndex: "shs_name",
            // width: 80,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.shs_name ?? "") == value,
          },
          {
            title: "门店ID",
            dataIndex: "shop_id",
            // width: 80,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.shop_id ?? "") == value,
          },
          // {
          //   title: "密码",
          //   dataIndex: "pw",
          //   // width: 100,
          //   onFilter: (value, record) => (record.pw ?? "") == value,
          // },
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
          .single("_shs")
          .then((res) => {
            this.table = res;
            this.loading = false;
          })
          .catch((err) => {
            message.error(err);
            this.loading = false;
          });
      },
      fetchShops() {
        new Shop()
          .all()
          .then((res) => {
            this.shops = res;
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
      addRecord() {
        this.isAddModalVis = true;
      },
      editRecord(record) {
        console.log(record);
        this.editModel = {
          id: record.id,
          a: record.shs_id,
          b: record.shs_name,
          c: record.shop_id,
          d: record.pw,
        };
        this.isEditModalVis = true;
      },
      handleAddSubmit() {
        console.log(this.addModel);
        new Probs()
          .addSss(this.addModel)
          .then((res) => {
            message.success(res);
            this.isAddModalVis = false;
            this.fetchTable();
          })
          .catch((err) => {
            message.error(err);
          });
      },
      onShopFilter(inp, opt) {
        return Boolean(
          opt.xshop.shop_name?.includes(inp) ||
            `${opt.xshop.shop_id}`.includes(inp)
        );
      },
      onShopSelect(value, mode) {
        const s = this.shops.find((v) => v.shop_id == value);
        if (!s) return;
        switch (mode) {
          case "add":
            this.addModel.b = s.shop_name;
        }
      },
      handleEditSubmit() {
        console.log(this.editModel);
        new Probs()
          .editSss(this.editModel)
          .then((res) => {
            message.success(res);
            this.isEditModalVis = false;
            this.fetchTable();
          })
          .catch((err) => {
            message.error(err);
          });
      },
      delRecord(record) {
        new Probs()
          .delSss({ id: record.id })
          .then((res) => {
            message.success(res);
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
      this.scrollY = document.body.clientHeight - 204;
      this.debounce_save = this.debounce(this.save);
      this.fetchShops();
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
