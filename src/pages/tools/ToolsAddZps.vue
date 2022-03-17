<template lang="pug">
div
  a-table.ant-table-change(
    :columns="columns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="{ showSizeChanger: true, defaultPageSize: 50, pageSizeOptions: ['50', '100', '200', '400'], size: 'small' }",
    size="small",
    :scroll="{ y: scrollY, x: scrollX }",
    :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
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
      template(v-if="column.dataIndex == '备注'")
        a-select(
          :value="text",
          :options="remark_options",
          :placeholder="text",
          size="small",
          @select="(value) => remarkRecord(value, record)",
          style="width: 130px"
        )
      template(v-else-if="column.dataIndex == 'key'")
        a-button(type="link", size="small", @click="() => editRecord(record)") 编辑
        a-button(
          type="link",
          size="small",
          @click="() => delRecord(record.店铺ID)"
        ) 删除

  a-modal(
    v-model:visible="login_modal_show",
    :title="null",
    :footer="null",
    centered,
    :width="650"
  )
    Login(@login-success="onLoginSuccess")

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
      //- a-input(v-model:value="addModel.a")
      .form-acct-items
        a-form-item(label="门店ID")
          a-auto-complete(
            v-model:value="addModel.shop_id",
            :options="shop_options"
          )
            template(#options="{ value, label }")
              div {{ label }}
        a-form-item(label="店铺名称")
          a-input(v-model:value="addModel.shop_name")
        a-form-item(label="城市")
          a-input(v-model:value="addModel.city")
        a-form-item(label="负责人")
          a-input(v-model:value="addModel.person")
        a-form-item(label="物理店")
          a-input(v-model:value="addModel.real_shop")
        a-form-item(label="平台")
          a-select(v-model:value="addModel.platform", :options="platform_options")
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
        a-form-item(label="顺丰ID")
          a-input(v-model:value="addModel.sf_id")
        a-form-item(label="顺丰配送经理")
          a-input(v-model:value="addModel.sf_manager")
        a-form-item(label="闪时送账号")
          a-input(v-model:value="addModel.sss_acct")
        a-form-item(label="闪时送密码")
          a-input(v-model:value="addModel.sss_pw")
        //- a-form-item(label="外卖邦账号")
        //- a-input(v-model:value="addModel.wmb_acct")
        //- a-form-item(label="外卖邦密码")
        //- a-input(v-model:value="addModel.wmb_pw")
        a-form-item(label="麦芽田账号")
          a-input(v-model:value="addModel.myt_acct")
        a-form-item(label="麦芽田密码")
          a-input(v-model:value="addModel.myt_pw")
        a-form-item(label="闪送账号")
          a-input(v-model:value="addModel.ss_acct")
        a-form-item(label="闪送密码")
          a-input(v-model:value="addModel.ss_pw")
        a-form-item(label="UU账号")
          a-input(v-model:value="addModel.uu_acct")
        a-form-item(label="UU密码")
          a-input(v-model:value="addModel.uu_pw")
        a-form-item(label="送件侠账号")
          a-input(v-model:value="addModel.sjx_acct")
        a-form-item(label="超级验证码")
          a-input(v-model:value="addModel.sjx_code")
        a-form-item(label="店铺账号")
          a-input(v-model:value="addModel.shop_account")
        a-form-item(label="店铺密码")
          a-input(v-model:value="addModel.shop_password")
        a-form-item(label="绑定电话")
          a-input(v-model:value="addModel.shop_phone")

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
      .form-acct-items
        a-form-item(label="门店ID")
          a-auto-complete(
            v-model:value="editModel.shop_id",
            :disabled="true",
            :options="shop_options"
          )
            template(#options="{ value, label }")
              div {{ label }}
        a-form-item(label="店铺名称")
          a-input(v-model:value="editModel.shop_name")
        a-form-item(label="城市")
          a-input(v-model:value="editModel.city")
        a-form-item(label="负责人")
          a-input(v-model:value="editModel.person")
        a-form-item(label="物理店")
          a-input(v-model:value="editModel.real_shop")
        a-form-item(label="平台")
          a-select(v-model:value="editModel.platform", :options="platform_options")
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
        a-form-item(label="顺丰ID")
          a-input(v-model:value="editModel.sf_id")
        a-form-item(label="顺丰配送经理")
          a-input(v-model:value="editModel.sf_manager")
        a-form-item(label="闪时送账号")
          a-input(v-model:value="editModel.sss_acct")
        a-form-item(label="闪时送密码")
          a-input(v-model:value="editModel.sss_pw")
        //- a-form-item(label="外卖邦账号")
        //- a-input(v-model:value="editModel.wmb_acct")
        //- a-form-item(label="外卖邦密码")
        //- a-input(v-model:value="editModel.wmb_pw")
        a-form-item(label="麦芽田账号")
          a-input(v-model:value="editModel.myt_acct")
        a-form-item(label="麦芽田密码")
          a-input(v-model:value="editModel.myt_pw")
        a-form-item(label="闪送账号")
          a-input(v-model:value="editModel.ss_acct")
        a-form-item(label="闪送密码")
          a-input(v-model:value="editModel.ss_pw")
        a-form-item(label="UU账号")
          a-input(v-model:value="editModel.uu_acct")
        a-form-item(label="UU密码")
          a-input(v-model:value="editModel.uu_pw")
        a-form-item(label="送件侠账号")
          a-input(v-model:value="editModel.sjx_acct")
        a-form-item(label="超级验证码")
          a-input(v-model:value="editModel.sjx_code")
        a-form-item(label="店铺账号")
          a-input(v-model:value="editModel.shop_account")
        a-form-item(label="店铺密码")
          a-input(v-model:value="editModel.shop_password")
        a-form-item(label="绑定电话")
          a-input(v-model:value="editModel.shop_phone")

      a-form-item(:wrapper-col="{ span: 12, offset: 5 }")
        a-button(type="primary", html-type="submit") 提交

  a-modal(
    v-model:visible="logs_modal_show",
    :title="null",
    :footer="null",
    centered,
    :width="modalX"
  )
    .modal
      tools-zps-logs

  a-modal(
    v-model:visible="batch_modal_show",
    :title="null",
    :footer="null",
    centered,
    :width="modalX"
  )
    .modal
      tools-zps-shop-upd

  .left-bottom-div(v-show="!loading", style="bottom: 10px")
    a-button(type="link", size="small", @click="addRecord") 新增
    a-button(type="link", size="small", @click="showShopUpd") 批量更新
    a-button(type="link", size="small", @click="fetchTable") 刷新
    a-button(type="link", size="small", @click="showLogs") 记录

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
  import app from "apprun";
  import { message } from "ant-design-vue";
  import Probs from "../../api/probs";
  import Shop from "../../api/shop";
  import ins from "../../api/base4";
  import TableSelect from "../../components/TableSelect";
  import ToolsZpsLogs from "../../components/zps/ToolsZpsLogs";
  import ToolsZpsShopUpd from "../../components/zps/ToolsZpsShopUpd";
  import Login from "../../components/user/Login";

  function keepBy(item, keys) {
    return keys.reduce((acc, key) => ({ ...acc, [key]: item[key] }), {});
  }

  function omitBy(item, keys) {
    return keepBy(
      item,
      Object.keys(item).filter((k) => !keys.includes(k))
    );
  }

  export default {
    name: "tools-add-zps",
    components: {
      TableSelect,
      ToolsZpsLogs,
      ToolsZpsShopUpd,
      Login,
    },
    data() {
      return {
        table: [],
        table_len: 0,
        loading: false,
        scrollY: 900,
        modalX: 850,
        debounce_save: null,
        exporting: false,
        tableUrl: null,
        isAddModalVis: false,
        isEditModalVis: false,
        shops: [],
        addModel: {
          shop_id: "",
          shop_name: "",
          dd_acct: "",
          dd_pw: "",
          fn_acct: "",
          fn_pw: "",
          sf_acct: "",
          sf_pw: "",
          sf_id: "",
          sf_manager: "",
          sss_acct: "",
          sss_pw: "",
          // wmb_acct: "",
          // wmb_pw: "",
          myt_acct: "",
          myt_pw: "",
          ss_acct: "",
          ss_pw: "",
          uu_acct: "",
          uu_pw: "",
          sjx_acct: "",
          sjx_code: "",
          city: "",
          person: "",
          real_shop: "",
          platform: "",
          shop_account: "",
          shop_password: "",
          shop_phone: "",
          remark: "",
        },
        editModel: {
          shop_id: "",
          shop_name: "",
          dd_acct: "",
          dd_pw: "",
          fn_acct: "",
          fn_pw: "",
          sf_acct: "",
          sf_pw: "",
          sf_id: "",
          sf_manager: "",
          sss_acct: "",
          sss_pw: "",
          // wmb_acct: "",
          // wmb_pw: "",
          myt_acct: "",
          myt_pw: "",
          ss_acct: "",
          ss_pw: "",
          uu_acct: "",
          uu_pw: "",
          sjx_acct: "",
          sjx_code: "",
          city: "",
          person: "",
          real_shop: "",
          platform: "",
          shop_account: "",
          shop_password: "",
          shop_phone: "",
          remark: "",
        },
        debounceRemark: null,
        remark_options: [
          { value: "已申请（门店负责人）" },
          { value: "已提交（自配送）" },
          { value: "已批复（BD批下来）" },
          { value: "不自配" },
          { value: "需和老板沟通" },
          { value: "已登记" },
          { value: "已自配" },
        ],
        platform_options: [
          { label: "美团", value: 1 },
          { label: "饿了么", value: 2 },
        ],
        logs: [],
        logs_modal_show: false,
        login_modal_show: false,
        batch_modal_show: false,
      };
    },
    computed: {
      columns() {
        // shop_id shop_name 城市 物理店 person 配送方式 platform dd账号 dd密码 fn账号 fn密码 sf账号 sf密码 闪时送账号 闪时送密码 外卖邦账号 外卖邦密码 麦芽田账号 麦芽田密码
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
          "顺丰ID",
          "配送经理",
          "店铺账号",
          "店铺密码",
          "绑定电话",
          "闪时送账号",
          "闪时送密码",
          "麦芽田账号",
          "麦芽田密码",
          "闪送账号",
          "闪送密码",
          "UU账号",
          "UU密码",
          "送件侠账号",
          "超级验证码",
          "备注",
        ];

        let base_columns = column_names.map((name) => {
          let config = {
            title: name,
            dataIndex: name,
            width: 70,
            customFilterDropdown: true,
            onFilter: (value, record) => (record[name] ?? "") == value,
          };
          if (name == "店铺ID")
            return {
              ...config,
              // fixed: "left",
            };
          if (name == "店铺名称")
            return {
              ...config,
              // fixed: "left",
              width: 120,
            };
          if (name == "物理店")
            return {
              ...config,
              width: 90,
              sorter: (a, b) => a.物理店?.localeCompare(b.物理店),
            };
          if (name == "备注")
            return {
              ...config,
              width: 140,
            };
          if (name.match(/城市|负责人|平台/)) return { ...config, width: 70 };
          return config;
        });

        let columns = [
          {
            title: "操作",
            dataIndex: "key",
            width: 60,
            // fixed: "left",
          },
          ...base_columns,
        ];

        return columns;
      },
      scrollX() {
        return this.columns
          .map((col) => col.width ?? 100)
          .reduce((p, v) => p + v, 50);
      },
      shop_options() {
        let options = this.shops
          .map((s) => ({
            value: String(s.shop_id),
            label: `${s.shop_name} ${s.platform == 1 ? "美团" : "饿了么"}`,
            id_name: `${s.shop_id} ${s.shop_name}`,
          }))
          .filter((s) => s.id_name.includes(this.addModel.shop_id));
        // console.log(options)
        return options;
      },
      account() {
        return this.$store.state.account ?? localStorage.getItem("account");
      },
      token() {
        return this.$store.state.token ?? localStorage.getItem("token");
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
        ins({
          data: {
            event: "get-zps",
          },
        })
          .then((res) => {
            this.table = res.zps;
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
          timeout = setTimeout(() => fn.apply(this, arguments), 900);
        };
      },
      addRecord() {
        this.isAddModalVis = true;
      },
      editRecord(rec) {
        console.log(rec);
        this.editModel = {
          shop_id: String(rec.店铺ID),
          shop_name: rec.店铺名称,
          city: rec.城市,
          person: rec.负责人,
          real_shop: rec.物理店,
          platform: rec.平台,
          dd_acct: rec.达达账号,
          dd_pw: rec.达达密码,
          fn_acct: rec.蜂鸟账号,
          fn_pw: rec.蜂鸟密码,
          sf_acct: rec.顺丰账号,
          sf_pw: rec.顺丰密码,
          sf_id: rec.顺丰ID,
          sf_manager: rec.配送经理,
          sss_acct: rec.闪时送账号,
          sss_pw: rec.闪时送密码,
          // wmb_acct: rec.外卖邦账号,
          // wmb_pw: rec.外卖邦密码,
          myt_acct: rec.麦芽田账号,
          myt_pw: rec.麦芽田密码,
          ss_acct: rec.闪送账号,
          ss_pw: rec.闪送密码,
          uu_acct: rec.UU账号,
          uu_pw: rec.UU密码,
          sjx_acct: rec.送件侠账号,
          sjx_code: rec.超级验证码,
          shop_account: rec.店铺账号,
          shop_password: rec.店铺密码,
          shop_phone: rec.绑定电话,
          remark: rec.备注,
        };
        this.isEditModalVis = true;
      },
      remarkRecord(value, record) {
        const target = this.table.filter((item) => record.key === item.key)[0];
        if (target) {
          target["备注"] = value;
          this.debounceRemark(record);
        }
      },
      onLoginSuccess() {
        this.login_modal_show = false;
      },
      handleRemarkSubmit(rec) {
        if (!this.account) {
          message.error("请先登录");
          this.login_modal_show = true;
          return;
        }
        const target = this.table.filter((item) => rec.key === item.key)[0];
        if (target) {
          ins({
            data: {
              event: "remark-zps",
              shop_id: String(rec.店铺ID),
              remark: target["备注"],
              meta: {
                account: this.account,
                token: this.token,
              },
            },
          })
            .then((res) => {
              message.success("更新成功");
            })
            .catch((err) => message.error(err));

          // new Probs()
          // .remarkZps({ shop_id: String(rec.店铺ID), remark: target["备注"] })
          // .then((res) => {
          // console.log(res);
          // message.success(res);
          // })
          // .catch((err) => {
          // message.error(err);
          // });
        }
      },
      handleAddSubmit() {
        console.log(this.addModel);
        if (!this.account) {
          message.error("请先登录");
          this.login_modal_show = true;
          return;
        }

        ins({
          data: {
            event: "add-zps",
            ...omitBy(this.addModel, [
              "shop_name",
              "city",
              "person",
              "real_shop",
              "platform",
              "shop_account",
              "shop_password",
              "shop_phone",
              "remark",
            ]),
            meta: {
              account: this.account,
              token: this.token,
            },
          },
        })
          .then((res) => {
            return ins({
              data: {
                event: "edit-zps-shop",
                ...keepBy(this.addModel, [
                  "shop_id",
                  "shop_name",
                  "city",
                  "person",
                  "real_shop",
                  "platform",
                  "shop_account",
                  "shop_password",
                  "shop_phone",
                ]),
                meta: {
                  account: this.account,
                  token: this.token,
                },
              },
            });
          })
          .then((res) => {
            message.success("修改成功");
            this.isAddModalVis = false;
            this.fetchTable();
          })
          .catch((err) => message.error(err));

        // new Probs()
        // .addZps(this.addModel)
        // .then((res) => {
        // message.success(res);
        // this.isAddModalVis = false;
        // this.fetchTable();
        // })
        // .catch((err) => {
        // message.error(err);
        // });
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
        if (!this.account) {
          message.error("请先登录");
          this.login_modal_show = true;
          return;
        }

        ins({
          data: {
            event: "edit-zps",
            ...omitBy(this.editModel, [
              "shop_name",
              "city",
              "person",
              "real_shop",
              "platform",
              "shop_account",
              "shop_password",
              "shop_phone",
              "remark",
            ]),
            meta: {
              account: this.account,
              token: this.token,
            },
          },
        })
          .then((res) => {
            return ins({
              data: {
                event: "edit-zps-shop",
                ...keepBy(this.editModel, [
                  "shop_id",
                  "shop_name",
                  "city",
                  "person",
                  "real_shop",
                  "platform",
                  "shop_account",
                  "shop_password",
                  "shop_phone",
                ]),
                meta: {
                  account: this.account,
                  token: this.token,
                },
              },
            });
          })
          .then((res) => {
            message.success("修改成功");
            this.isEditModalVis = false;
            this.fetchTable();
          })
          .catch((err) => message.error(err));
      },
      delRecord(sid) {
        if (!this.account) {
          message.error("请先登录");
          this.login_modal_show = true;
          return;
        }

        ins({
          data: {
            event: "delete-zps-shop",
            shop_id: sid,
            shop_delete: 1,
            meta: {
              account: this.account,
              token: this.token,
            },
          },
        })
          .then((res) => {
            message.success("删除成功");
            this.fetchTable();
          })
          .catch((err) => message.error(err));
      },
      onSelectChange(checks) {
        console.log(checks);
      },
      showLogs() {
        this.logs_modal_show = true;
      },
      showShopUpd() {
        this.batch_modal_show = true;
      },
      transformTable() {
        return this.table;
      },
      exportTable() {
        this.exporting = true;
        app.run("ws://", "@export-table", {
          json: this.transformTable(),
        });
      },
    },
    created() {
      app.on("@export-table", (state) => {
        console.log(state);
        this.exporting = false;
        this.tableUrl = state.path;
      });

      this.debounceRemark = this.debounce(this.handleRemarkSubmit);
      this.fetchShops();
      this.fetchTable();
    },
    mounted() {
      this.modalX = Math.min(1100, Math.floor(document.body.clientWidth * 0.8));
      this.scrollY = document.body.clientHeight - 160;
    },
  };
</script>

<style lang="sass" scoped>
.modal
  padding-right: 60px

.form-acct-items
  columns: 2
</style>
