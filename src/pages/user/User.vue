<template lang="pug">
.user
  .header
    span.header-name(@click="open_drawer") {{ username }}
    div
      a-date-picker(
        v-model:value="selected_date",
        @change="date_change",
        size="small"
      )
  a-tabs(
    v-model:activeKey="activeKey",
    @tabClick="tab_click",
    style="width: 960px",
    size="small"
  )
    a-tab-pane(key="1", :tab="tab_activities")
      a-spin(:spinning="spinning")
        user-activities(:activities="activities.activities")

    a-tab-pane(key="2", :tab="tab_responsibles")
      a-spin(:spinning="spinning")
        user-shops(
          :shops="user.responsibles",
          type="responsibles",
          :counts="user.counts.responsibles"
        )

    a-tab-pane(key="6", :tab="tab_improving")
      a-spin(:spinning="spinning")
        user-shops(
          :shops="user.failure.improving",
          type="improving",
          :counts="user.counts.failure.improving"
        )

    a-tab-pane(key="4", :tab="tab_unimproved")
      a-spin(:spinning="spinning")
        user-shops(
          :shops="user.failure.unimproved",
          type="unimproved",
          :counts="user.counts.failure.unimproved"
        )

    a-tab-pane(key="5", :tab="tab_improved")
      a-spin(:spinning="spinning")
        user-shops(
          :shops="user.failure.improved",
          type="improved",
          :counts="user.counts.failure.improved"
        )

    a-tab-pane(key="3", :tab="tab_success")
      a-spin(:spinning="spinning")
        user-shops(
          :shops="user.success",
          type="success",
          :counts="user.counts.success"
        )
  a-back-top
      //- router-link(:to="{name: 'user-acts', params: {username}}") acts
</template>

<script>
import { message } from "ant-design-vue";
import UserActivities from "./UserActivities";
import UserShops from "./UserShops";
import dayjs from "dayjs";
import moment from "moment";
import baseFetch from "../../api/base";

export default {
  components: {
    UserActivities,
    UserShops,
  },
  data() {
    return {
      user: {
        counts: {
          responsibles: {
            count_a: 0,
            count_q: 0,
            count_shop: 0,
            count_shop_a: 0,
          },
          success: {
            count_a: 0,
            count_q: 0,
            count_shop: 0,
            count_shop_a: 0,
          },
          failure: {
            unimproved: {
              count_a: 0,
              count_q: 0,
              count_shop: 0,
              count_shop_a: 0,
            },
            improved: {
              count_a: 0,
              count_q: 0,
              count_shop: 0,
              count_shop_a: 0,
            },
            improving: {
              count_a: 0,
              count_q: 0,
              count_shop: 0,
              count_shop_a: 0,
            },
          },
          activities: {
            count_a: 0,
            count_shop: 0,
          },
        },
      },
      spinning: false,
      activeKey: "1",
      activities: {
        counts: {
          activities: {
            count_a: 0,
            count_shop: 0,
          },
        },
      },
      selected_date: null,
      last_user_route: { path: "" },
      drawer_visible: false,
    };
  },
  computed: {
    username() {
      return this.$route.params.username;
    },
    date() {
      return this.$route.params.date;
    },
    tab_activities() {
      let t = this.activities.counts.activities;
      return `动态 ${t.count_a}/${t.count_shop}`;
    },
    tab_responsibles() {
      console.log(this.user);
      let t = this.user.counts.responsibles;
      return `负责 ${t.count_a}/${t.count_q}/${t.count_shop_a}/${t.count_shop}`;
    },
    tab_success() {
      let t = this.user.counts.success;
      return `success ${t.count_shop}`;
    },
    tab_unimproved() {
      let t = this.user.counts.failure.unimproved;
      return `未优化 ${t.count_q}/${t.count_shop}`;
    },
    tab_improved() {
      let t = this.user.counts.failure.improved;
      return `全优化 ${t.count_a}/${t.count_shop}`;
    },
    tab_improving() {
      let t = this.user.counts.failure.improving;
      return `优化中 ${t.count_a}/${t.count_q}/${t.count_shop_a}/${t.count_shop}`;
    },
    is_jump() {
      return this.$route.query.jump;
    },
  },
  methods: {
    fetch_user_single() {
      this.spinning = true;
      baseFetch({
        url: `/v1/users/${this.username}/operatings`,
        params: {
          day: parseInt(this.date) + 1,
        },
      })
        .then((res) => {
          if (res && Object.keys(res).length >= 1) this.user = res;
          this.spinning = false;
        })
        .catch((e) => {
          message.error(e.message);
          this.spinning = false;
        });
    },
    fetch_user_single_acts() {
      this.spinning = true;
      baseFetch({
        url: `/v1/users/${this.username}/operatings/as`,
        params: {
          day: parseInt(this.date),
        },
      })
        .then((res) => {
          if (res && Object.keys(res).length >= 1) this.activities = res;
          this.spinning = false;
        })
        .catch((e) => {
          message.error(e.message);
          this.spinning = false;
        });
    },
    tab_click(key) {
      if (this.activeKey == key) {
        this.init();
      }
    },
    date_change(date, date_str) {
      let date1 = dayjs().startOf("day").diff(dayjs(date_str).startOf("day"), "day");
      this.$router.replace({
        name: "user",
        params: { username: this.username, date: date1 },
      });
    },
    getDisabledDate(date) {
      return date < dayjs().subtract(30, "days");
    },
    open_drawer() {
      this.drawer_visible = true;
    },
    init() {
      this.selected_date = dayjs().startOf("day").subtract(this.date, "days");
      this.fetch_user_single();
      this.fetch_user_single_acts();
    },
  },
  created() {
    this.init();
  },
  watch: {
    $route(route) {
      if (route.name == "user" && route.path != this.last_user_route.path) {
        this.init();
        this.last_user_route = route;
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.user
  display: flex
  flex-direction: column
  align-items: center
  width: 100%
  min-height: 100vh
  background: #fbfbfb

.header
  display: flex
  max-width: 960px
  width: 100%
  height: 60px
  justify-content: space-between
  align-items: center
  padding: 12px

.header-name
  font-size: 1.1em
  cursor: pointer
</style>
