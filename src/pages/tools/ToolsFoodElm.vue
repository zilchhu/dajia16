<template lang="pug">
.tools-food-elm
  div(style="display: flex; align-items: center; column-gap: 0.75rem")
    a(href="/美团折扣商品涨原价表格模板.xlsx", target="_blank") 下载模板
    a-upload(
      v-model:file-list="fileList",
      action="http://192.168.3.3:9005/upload"
    )
      a-button(size="small")
        UploadOutlined
        span 上传表格
    a-button(@click="run", size="small", :disabled="false") 运行

    a-auto-complete(
      v-model:value="auth",
      placeholder="请输入Cookie",
      size="small",
      style="width: 400px"
    )
      template(#dataSource)
        a-select-option(v-for="au in auths", :key="`${au.shopId}||${au.auth}`") {{ au.shopId }} {{ au.shopName }} {{ au.auth }}
  p {{ fileList }}
  a-divider
  p(style="white-space: pre-wrap") {{ results.join('\n') }}
</template>

<script>
import { UploadOutlined } from "@ant-design/icons-vue";
import SockJS from "sockjs-client";
import { message } from "ant-design-vue";
import Shop from "../../api/shop";

export default {
  name: "tools-food-elm",
  components: {
    UploadOutlined,
  },
  data() {
    return {
      fileList: [],
      sock: new SockJS("http://192.168.3.3:9997/price_update3"),
      results: [],
      auths: [],
      auth: ''
    };
  },
  methods: {
    run() {
      let file = this.fileList.find((v) => v.status == "done");
      if (!file) {
        message.error("please upload a file");
        return;
      }
      if(this.auth.length == 0) {
         message.error("please input cookie");
        return;
      }
      console.log({ table: file.response.res.filename, auth: this.auth.split('||')[1] });
      this.sock.send(JSON.stringify({ table: file.response.res.filename, auth: this.auth.split('||')[1] }));
      this.sock.onmessage = (e) => {
        console.log("message", e.data);
        this.results.push(e.data);
        window.scrollTo(0, document.body.scrollHeight + 20);
      };
    },
    fetchAuths() {
      this.loading = false;
      new Shop()
        .auths()
        .then((res) => {
          this.auths = res.filter(v => v.platform == 2);
          this.loading = false;
        })
        .catch((err) => {
          message.error(err);
          this.loading = false;
        });
    },
  },
  created() {
    this.sock.onopen = function () {
      console.log("open");
    };

    this.sock.onclose = function () {
      console.log("close");
    };

    this.fetchAuths();
  },
};
</script>

<style lang="sass" scoped>
.tools-food-elm
  width: 960px
  margin: 20px auto
</style>
