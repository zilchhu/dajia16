<template lang="pug">
div
  a-tabs(
    v-model:activeKey="active_tab",
    tab-position="top",
    size="small",
    :tabBarGutter="20",
    :animated="{ inkBar: true, tabPane: true }"
  )
    a-tab-pane(key="login", tab="登录")
      a-form(
        ref="login-form",
        :model="login_model",
        :label-col="{ span: 5 }",
        :wrapper-col="{ span: 16 }",
        @submit="handleLogin"
      )
        a-form-item(label="账号")
          a-input(v-model:value="login_model.account")

        a-form-item(label="密码")
          a-input-password(v-model:value="login_model.password")

        a-form-item(:wrapper-col="{ span: 12, offset: 5 }")
          a-button(type="primary", html-type="submit") 登录

    a-tab-pane(key="register", tab="注册")
      a-form(
        ref="register-form",
        :model="register_model",
        :label-col="{ span: 5 }",
        :wrapper-col="{ span: 16 }",
        @submit="handleRegister"
      )
        a-form-item(label="账号")
          a-input(v-model:value="register_model.account")

        a-form-item(label="密码")
          a-input-password(v-model:value="register_model.password")

        a-form-item(label="姓名")
          a-auto-complete(
            v-model:value="register_model.name",
            :options="available_user_names_opts"
          )
            template(#options="{ value, label }")
              div {{ label }}

        a-form-item(:wrapper-col="{ span: 12, offset: 5 }")
          a-button(type="primary", html-type="submit") 注册
</template>

<script>
  import md5 from "md5";
  import ins from "../../api/base4";
  import { message } from "ant-design-vue";

  export default {
    name: "login",
    data() {
      return {
        login_model: {
          account: "",
          password: "",
        },
        register_model: {
          account: "",
          password: "",
          name: "",
        },
        available_user_names: [],
        active_tab: "login", // register
      };
    },
    computed: {
      available_user_names_opts() {
        return this.available_user_names
          .map((u) => ({
            value: u,
            label: u,
          }))
          .filter((u) => u.label.includes(this.register_model.name));
      },
    },
    methods: {
      empty(value) {
        return value == null || value == "";
      },
      handleLogin() {
        ins({
          data: {
            event: "login",
            account: this.login_model.account,
            password: this.empty(this.login_model.password)
              ? ""
              : md5(this.login_model.password),
          },
        })
          .then((res) => {
            message.success("登录成功");
            this.$store.commit("setAccount", this.login_model.account);
            this.$store.commit("setToken", res.token);
            this.$emit("login-success");
          })
          .catch((err) => message.error(err));
      },
      handleRegister() {
        ins({
          data: {
            event: "register",
            account: this.register_model.account,
            password: this.empty(this.register_model.password)
              ? ""
              : md5(this.register_model.password),
            name: this.register_model.name,
          },
        })
          .then((res) => {
            message.success("注册成功");
            this.active_tab = "login";
          })
          .catch((err) => message.error(err));
      },
      initAvailableUserNames() {
        ins({
          data: {
            event: "get-user-names",
          },
        })
          .then((res) => {
            this.available_user_names = res.names;
          })
          .catch((err) => console.error(err));
      },
      // onNameFocus() {
      //   // this.initAvailableUserNames();
      // }
    },
    mounted() {
      this.initAvailableUserNames();
    },
  };
</script>