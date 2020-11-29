<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    okText="タスクを保存してスケジュールする"
    cancelText="クローズ">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="タスククラス名"
          hasFeedback >
          <a-input placeholder="タスククラス名を入力してください" v-decorator="['jobClassName', {rules: [{ required: true, message: 'タスククラス名を入力してください!' }]}]" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="cron式">
<!--                    <a-input placeholder="cron式を入力してください" v-decorator="['cronExpression', {'initialValue':'0/1 * * * * ?',rules: [{ required: true, message: 'タスククラス名を入力してください!' }]}]" />-->
<!--                    <a target="_blank" href="http://cron.qqe2.com/">-->
<!--                      <a-icon type="share-alt" />-->
<!--                      オンラインcron式の生成-->
<!--                    </a>-->
<!--          <j-cron ref="innerVueCron" v-decorator="['cronExpression', {'initialValue':'0/1 * * * * ?',rules: [{ required: true, message: 'cron式を入力してください!' }]}]"  @change="setCorn"></j-cron>-->
          <j-cron ref="innerVueCron" v-decorator="['cronExpression', { initialValue: '* * * * * ? *' }]" @change="setCorn"></j-cron>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="パラメータ">
          <a-textarea placeholder=パラメータを入力してください" :rows="5" v-decorator="['parameter', {}]" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="説明">
          <a-textarea placeholder="説明を入力してください" :rows="3" v-decorator="['description', {}]" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ステータス">
          <j-dict-select-tag type="radioButton"  v-decorator="[ 'status', {'initialValue':0}]" :trigger-change="true" dictCode="quartz_status"/>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import JCron from "@/components/jeecg/JCron";
  import pick from 'lodash.pick'
  // import moment from "moment"

  export default {
    name: "QuartzJobModal",
    components: {
      JCron
    },
    data () {
      return {
        title:"操作",
        buttonStyle: 'solid',
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        cron: {
          label: '',
          value: ''
        },
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {
          cron: {
            rules: [{
              required: true, message: 'cron式を入力してください!'
            }]
          }
        },
        url: {
          add: "/sys/quartzJob/add",
          edit: "/sys/quartzJob/edit",
        },
      }
    },
    created () {
    },
    methods: {
      add () {
        this.edit({});
      },
      edit (record) {
        let that = this;
        that.form.resetFields();
        this.model = Object.assign({},record);
        console.log(this.model)
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'jobClassName','cronExpression','parameter','description','status'));
        });

      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        // フォームの検証をトリガーする
        this.form.validateFields((err, values) => {
          console.log('values',values)
          if (!err) {
            if (typeof values.cronExpression == "undefined" || Object.keys(values.cronExpression).length==0 ) {
              this.$message.warning('cron式を入力してください!');
              return false;
            }

            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
              method = 'put';
            }
            let formData = Object.assign(this.model, values);
            //時間のフォーマット

            console.log('パラメータを送信する',formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })

          }
        })
      },
      handleCancel () {
        this.close()
      },
      setCorn(data){
        console.log('data)',data);
        this.$nextTick(() => {
          this.model.cronExpression = data;
        })

        // console.log(Object.keys(data).length==0);
        if (Object.keys(data).length==0) {
          this.$message.warning('cron式を入力してください!');
        }
      },
      validateCron(rule, value, callback){
        if(!value){
          callback()
        }else if (Object.keys(value).length==0) {
          callback("cron式を入力してください!");
        }
      },

    }
  }
</script>

<style scoped>

</style>