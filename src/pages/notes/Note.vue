<template lang="pug">
div.note
  main.note-main
    .editor
      a-textarea(v-model:value="editorText" :auto-size="{ minRows: 3}")
      .editor-buttons
        div
          a-auto-complete(v-model:value="user" style="width: 80px;")
            template(#dataSource)
              a-select-option(v-for="user in users" :key="user") {{user}}
          a-button(type="dashed" @click="e => imageUploaderVis = !imageUploaderVis" style="margin-left: 6px;") 图片 
        a-button(type="primary" @click="pub") 发布
    .editor-image-uploader(v-if="imageUploaderVis")
      a-upload(:action="uploadUrl" list-type="picture-card"  v-model:file-list="imageList")
        CloudUploadOutlined
    a-spin(:spinning="loading")
      a-list.note-list(:data-source="noteList" item-layout="vertical" :split="false")
        template(#renderItem="{ item }")
          a-list-item(:key="item.key")
            a-list-item-meta
              template(#title)
                .note-item-title 
                  span {{item.title}}
                  a-dropdown
                    DownOutlined
                    template(#overlay)
                      a-menu
                        a-menu-item(@click="e => del(item)") 删除
              template(#description)
                .note-item-description 
                  a-tooltip(:title="moment(item.updated_at).format('YYYY-MM-DD HH:mm:ss')")
                    span {{moment(item.updated_at).fromNow()}}

            template(#actions)
              .note-item-actions(@click="e => like(item.key)")
                LikeOutlined(style="margin-right: 6px;")
                span {{item.likes != '' ? item.likes.split('|').length : 0}} 
              .note-item-actions(@click="e => commentsVis[item.key] = !commentsVis[item.key]")
                MessageOutlined(style="margin-right: 6px;")
                span {{item.comments ? JSON.parse(item.comments).length : 0}} 

            div.note-item-content(contentEditable="true") {{item.content}}
            a-image-preview-group(v-if="item.images")
              a-image(v-for="img in item.images.split('|')" :width="200" :src="`${HOST}/${img}`")
            
            .note-item-comments(v-if="commentsVis[item.key]")
              a-input(v-model:value="commentsEditors[item.key]" @pressEnter="e => commentEnter(e, item.key)" size="small")
              a-comment(v-if="item.comments" v-for="com in JSON.parse(item.comments)" :key="com.id")
                template(#datetime)
                  a-tooltip(:title="com.inserted_at")
                    span {{moment(com.inserted_at).fromNow()}}
                template(#content)
                  p {{com.comment}}
              
</template>

<script>
import { message } from "ant-design-vue";
import {
  DownOutlined,
  CloudUploadOutlined,
  LikeOutlined,
  MessageOutlined,
} from "@ant-design/icons-vue";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import baseFetch, { HOST } from "../../api/base";

export default {
  name: "Note",
  components: {
    DownOutlined,
    CloudUploadOutlined,
    LikeOutlined,
    MessageOutlined,
  },
  data() {
    return {
      HOST,
      uploadUrl: `${HOST}/api/common/v1/upload`,
      user: "匿名",
      editorText: "",
      noteList: [],
      loading: false,
      moment,
      imageUploaderVis: false,
      commentsVis: {},
      commentsEditors: {},
      imageList: [],
    };
  },
  computed: {
    users() {
      return ["匿名"];
    },
  },
  methods: {
    pub() {
      if (this.editorText.trim() == "" || this.user.trim() == "") return;
      this.loading = true;
      let key = uuidv4();
      let description = "";
      let images = this.imageList
        .filter((v) => v.status == "done" && v.response.code == 1)
        .map((v) => v.response.res.filename)
        .join("|");

      baseFetch({
        method: "POST",
        url: "/v1/tools/notes",
        data: {
          key,
          title: this.user,
          description,
          content: this.editorText,
          images,
        },
      })
        .then((res) => {
          this.noteList = [
            {
              key,
              title: this.user,
              description,
              content: this.editorText,
              images,
              likes: 0,
            },
            ...this.noteList,
          ];
          this.editorText = "";
          this.imageList = [];
          this.imageUploaderVis = false;
          message.success(res);
          this.loading = false;
        })
        .catch((err) => {
          message.error(err.message);
          this.loading = false;
        });
    },
    del(item) {
      this.loading = true;
      baseFetch({
        method: "DELETE",
        url: `/v1/tools/notes/${item.key}`,
      })
        .then((res) => {
          this.noteList.splice(
            this.noteList.findIndex((v) => v.key == item.key),
            1
          );
          message.success(res);
          this.loading = false;
        })
        .catch((err) => {
          message.error(err.message);
          this.loading = false;
        });
    },
    like(key) {
      baseFetch({
        method: "PUT",
        url: `/v1/tools/notes/${key}/likes`,
      })
        .then((res) => {
          console.log(res);
          let i = this.noteList.findIndex((v) => v.key == key);
          if (i >= 0) this.noteList[i].likes += 1;
        })
        .catch((err) => {
          message.error(err.message);
        });
    },
    commentEnter(e, key) {
      if (e.target.value.trim() == "") return;
      baseFetch({
        method: "POST",
        url: `/v1/tools/notes/${key}/comments`,
        data: {
          comment: e.target.value,
        },
      })
        .then((res) => {
          let i = this.noteList.findIndex((v) => v.key == key);
          if (i >= 0) this.noteList[i].comments = res;
          this.commentsEditors[key] = "";
        })
        .catch((err) => {
          message.error(err.message);
        });
    },
    fetchNotes() {
      this.loading = true;
      baseFetch({
        url: "/v1/tools/notes",
      })
        .then((res) => {
          this.noteList = res;
          this.loading = false;
        })
        .catch((err) => {
          message.error(err.message);
          this.loading = false;
        });
    },
  },
  created() {
    this.fetchNotes();
  },
};
</script>

<style lang="sass" scoped>
.note
  display: flex
  flex-direction: column
  align-items: center
  width: 100%
  min-height: 100vh

.note-main
  max-width: 960px
  width: 100%

.editor
  margin: 20px 0

.editor-buttons
  margin-top: 6px
  display: flex
  justify-content: space-between

.note-item-actions
  display: flex

.note-item-title
  display: flex
  justify-content: space-between
  font-size: 12px
  color: #00000073

.note-item-title > span:first-child
  font-size: 1.05em
  font-weight: bold
  color: black

.note-item-description
  font-size: 0.7em

.note-item-content
  font-size: 1.2em
  white-space: pre-wrap

.note-item-actions
  display: flex
  align-items: center
  font-size: 12px

.note-item-comments
  margin-top: 10px
  background: #f5f5f533

.note-item-comments > input
  margin: 4px 12px
  width: calc(100% - 24px)
  background: #f5f5f533
</style>
