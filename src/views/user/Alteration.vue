<template>
  <a-card :bordered="false" style="width: 130%;text-align: center;margin-left:-10%">
    <a-steps class="steps" :current="currentTab">
      <a-step title="携帯の確認コード"/>
      <a-step title="パスワード"/>
      <a-step title="完成"/>
    </a-steps>
    <div class="content">
      <step2 v-if="currentTab === 0" @nextStep="nextStep"/>
      <step3 v-if="currentTab === 1" @nextStep="nextStep" @prevStep="prevStep" :userList="userList"/>
      <step4 v-if="currentTab === 2" @prevStep="prevStep" @finish="finish" :userList="userList"/>
    </div>
  </a-card>
</template>

<script>
  import Step1 from './Step1'
  import Step2 from './Step2'
  import Step3 from './Step3'
  import Step4 from './Step4'

  export default {
    name: "Alteration",
    components: {
      Step1,
      Step2,
      Step3,
      Step4
    },
    data() {
      return {
        description: '長い又は馴染みのないフォームタスクを複数のステップに分割して、ユーザーをガイドします。',
        currentTab: 0,
        userList: {},
        // form
        form: null,
      }
    },
    methods: {

      // handler
      nextStep(data) {
        this.userList = data;
        if (this.currentTab < 4) {
          this.currentTab += 1
        }
      },
      prevStep(data) {
        this.userList = data;
        if (this.currentTab > 0) {
          this.currentTab -= 1
        }
      },
      finish() {
        this.currentTab = 0
      }
    }
  }
</script>

<style lang="less" scoped>
  .steps {
    max-width: 750px;
    margin: 16px auto;
  }
</style>