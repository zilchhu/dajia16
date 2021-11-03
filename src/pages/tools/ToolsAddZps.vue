<template lang="pug">
div
  a-table.ant-table-change(
    :columns="columns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="{ showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small' }",
    size="small",
    :scroll="{ y: scrollY, x: scrollX }",
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
    :width="850"
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
          v-model:value="addModel.shop_id",
          :filterOption="onShopFilter",
          @select="(value) => onShopSelect(value, 'add')",
          show-search
        )
          a-select-option(
            v-for="s in shops",
            :key="s.shop_id",
            :xshop="s",
            :value="s.shop_id"
          ) {{ s.shop_name }} {{s.platform}}
      
      .form-acct-items
        a-form-item(label="达达账号")
          a-input(v-model:value="addModel.dd_acct")
        a-form-item(label="达达密码")
          a-input(v-model:value="addModel.dd_pw")
        a-form-item(label="蜂鸟账号")
          a-input(v-model:value="addModel.fn_acct")
        a-form-item(label="蜂鸟密码")
          a-input(v-model:value="addModel.fn_pw")
        a-form-item(label="顺丰账号")
          a-input(v-model:value="addModel.sf_acct")
        a-form-item(label="顺丰密码")
          a-input(v-model:value="addModel.sf_pw")
        a-form-item(label="闪时送账号")
          a-input(v-model:value="addModel.sss_acct")
        a-form-item(label="闪时送密码")
          a-input(v-model:value="addModel.sss_pw")
        a-form-item(label="外卖邦账号")
          a-input(v-model:value="addModel.wmb_acct")
        a-form-item(label="外卖邦密码")
          a-input(v-model:value="addModel.wmb_pw")
        a-form-item(label="麦芽田账号")
          a-input(v-model:value="addModel.myt_acct")
        a-form-item(label="麦芽田密码")
          a-input(v-model:value="addModel.myt_pw")

      a-form-item(:wrapper-col="{ span: 12, offset: 5 }")
        a-button(type="primary", html-type="submit") 提交

  a-modal(
    v-model:visible="isEditModalVis",
    title="编辑条目",
    :footer="null",
    centered,
    :width="850"
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
          v-model:value="editModel.shop_id",
          show-search,
          :filterOption="onShopFilter"
        )
          a-select-option(
            v-for="s in shops",
            :key="s.shop_id",
            :xshop="s",
            :value="s.shop_id"
          ) {{ s.shop_name }} {{ s.platform }}
      .form-acct-items
        a-form-item(label="达达账号")
          a-input(v-model:value="editModel.dd_acct")
        a-form-item(label="达达密码")
          a-input(v-model:value="editModel.dd_pw")
        a-form-item(label="蜂鸟账号")
          a-input(v-model:value="editModel.fn_acct")
        a-form-item(label="蜂鸟密码")
          a-input(v-model:value="editModel.fn_pw")
        a-form-item(label="顺丰账号")
          a-input(v-model:value="editModel.sf_acct")
        a-form-item(label="顺丰密码")
          a-input(v-model:value="editModel.sf_pw")
        a-form-item(label="闪时送账号")
          a-input(v-model:value="editModel.sss_acct")
        a-form-item(label="闪时送密码")
          a-input(v-model:value="editModel.sss_pw")
        a-form-item(label="外卖邦账号")
          a-input(v-model:value="editModel.wmb_acct")
        a-form-item(label="外卖邦密码")
          a-input(v-model:value="editModel.wmb_pw")
        a-form-item(label="麦芽田账号")
          a-input(v-model:value="editModel.myt_acct")
        a-form-item(label="麦芽田密码")
          a-input(v-model:value="editModel.myt_pw")

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
    name: "tools-add-zps",
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
          shop_id: "",
          dd_acct: "",
          dd_pw: "",
          fn_acct: "",
          fn_pw: "",
          sf_acct: "",
          sf_pw: "",
          sss_acct: "",
          sss_pw: "",
          wmb_acct: "",
          wmb_pw: "",
          myt_acct: "",
          myt_pw: "",
        },
        editModel: {
          shop_id: "",
          dd_acct: "",
          dd_pw: "",
          fn_acct: "",
          fn_pw: "",
          sf_acct: "",
          sf_pw: "",
          sss_acct: "",
          sss_pw: "",
          wmb_acct: "",
          wmb_pw: "",
          myt_acct: "",
          myt_pw: "",
        },
      };
    },
    computed: {
      columns() {
        // shop_id	shop_name	城市	物理店	person	配送方式	platform	dd账号	dd密码	fn账号	fn密码	sf账号	sf密码	闪时送账号	闪时送密码	外卖邦账号	外卖邦密码	麦芽田账号	麦芽田密码
        let column_names = [
          "店铺ID",
          "店铺名称",
          "城市",
          "物理店",
          "负责人",
          "平台",
          "配送方式",
          "达达账号",
          "达达密码",
          "蜂鸟账号",
          "蜂鸟密码",
          "顺丰账号",
          "顺丰密码",
          "闪时送账号",
          "闪时送密码",
          "外卖邦账号",
          "外卖邦密码",
          "麦芽田账号",
          "麦芽田密码",
        ];

        let base_columns = column_names.map((name) => {
          let config = {
            title: name,
            dataIndex: name,
            width: 100,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record[name] ?? "") == value,
          };
          if (name == "店铺ID")
            return {
              ...config,
              fixed: "left",
            };
          if (name == "店铺名称")
            return {
              ...config,
              fixed: "left",
              width: 180,
            };
          return config;
        });

        let columns = [
          ...base_columns,
          {
            title: "操作",
            dataIndex: "key",
            slots: { customRender: "operation" },
          },
        ];

        return columns;
      },
      scrollX() {
        return this.columns
          .map((col) => col.width ?? 100)
          .reduce((p, v) => p + v, 50);
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
          .single("_zps")
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
            this.shops = res.map((it) => ({
              ...it,
              platform: it.platform == 1 ? "美团" : "饿了么",
            }));
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
      editRecord(rec) {
        console.log(rec);
        this.editModel = {
          shop_id: rec.店铺ID,
          dd_acct: rec.达达账号,
          dd_pw: rec.达达密码,
          fn_acct: rec.蜂鸟账号,
          fn_pw: rec.蜂鸟密码,
          sf_acct: rec.顺丰账号,
          sf_pw: rec.顺丰密码,
          sss_acct: rec.闪时送账号,
          sss_pw: rec.闪时送密码,
          wmb_acct: rec.外卖邦账号,
          wmb_pw: rec.外卖邦密码,
          myt_acct: rec.麦芽田账号,
          myt_pw: rec.麦芽田密码,
        };
        this.isEditModalVis = true;
      },
      handleAddSubmit() {
        console.log(this.addModel);
        new Probs()
          .addZps(this.addModel)
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
          .editZps(this.editModel)
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
        return this.table
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


<style lang="sass" scoped>
.form-acct-items
  columns: 2
</style>