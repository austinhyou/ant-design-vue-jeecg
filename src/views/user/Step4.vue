<template>
  <div>
      <a-form style="margin: 40px auto 0;">
      <result title="パスワードは正常に変更されました" :is-success="true">
        <div class="toLogin">
          <h3><span>{{time}}</span>でログインページに戻ります.</h3>
        </div>
      </result>

      </a-form>
  </div>
</template>

<script>
  import Result from '@/views/result/Result'
  export default {
    name: "Step4",
    props:['userList'],
    components: {
      Result
    },
    data () {
      return {
        loading: false,
        time: 0,
      }
    },
    methods: {
      countDown(){
        let that = this;
        that.time--;
      }
    },
    mounted(){
      let that = this;
      that.time = 5;
      setInterval(that.countDown, 1000);
    },
    watch: {
      time: function (newVal,oldVal) {
        if (newVal == 0) {
          var params = {
            username: this.userList.username
          };
          this.$router.push({name: 'login', params})
        }
      }
    }
  }
</script>
<style scoped>
  .toLogin{
    text-align: center;
  }
</style>