<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="クローズ">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ユーザー名">
          <a-input placeholder="ユーザー名を入力してください" v-decorator="['userName', {}]" readOnly/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="代理人のユーザー名">
          <j-select-user-by-dep placeholder="代理人のユーザー名を入力してください" v-decorator="['agentUserName', validatorRules.agentUserName]" :trigger-change="true"></j-select-user-by-dep>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="代理の開始時間">
          <j-date
            v-decorator="[ 'startTime', validatorRules.startTime]"
            :trigger-change="true"
            :showTime="true"
            date-format="YYYY-MM-DD HH:mm:ss"
            style="width:100%"
            placeholder="開始時間を選択してください" >
          </j-date>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="代理の終了時間">
          <j-date
            v-decorator="[ 'endTime', validatorRules.endTime]"
            :trigger-change="true"
            :showTime="true"
            date-format="YYYY-MM-DD HH:mm:ss"
            style="width:100%"
            placeholder="終了時間を選択してください" >
          </j-date>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ステータス">
          <a-radio-group class="fontiframe" name="radioGroup" v-decorator="[ 'status', {}]">
            <a-radio class="radioGroup" value="1">有効</a-radio>
            <a-radio class="radioGroup" value="0">無効</a-radio>
          </a-radio-group>
        </a-form-item>

      </a-form>

    </a-spin>
  </a-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import { httpAction, getAction } from '@/api/manage'
  import JDate from '@/components/jeecg/JDate.vue';
  import JSelectUserByDep from '@/components/jeecgbiz/JSelectUserByDep'

  export default {
    name: "SysUserAgentModal",
    components: {
      JDate,
      JSelectUserByDep
    },
    data () {
      return {
        title:"操作",
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
        username:"",
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules:{
          agentUserName:{rules: [{ required: true, message: '代理人のユーザー名を入力してください!' }]},
          startTime:{rules: [{ required: true, message: '代理の開始時間を入力してください！' }]},
          endTime:{rules: [{ required: true, message: '代理の終了時間を入力してください！' }]},
        },
        url: {
          add: "/sys/sysUserAgent/add",
          edit: "/sys/sysUserAgent/edit",
          queryByUserName:"/sys/sysUserAgent/queryByUserName",
        },
      }
    },
    created () {
    },
    methods: {
      agentSettings(username){
        this.username = username;
        this.init();

      },
      init () {
        var params = {userName:this.username};//クエリ条件
        getAction(this.url.queryByUserName,params).then((res)=>{
          if(res.success){
            console.log("プロセスノード情報を取得する",res);
            this.edit (res.result);
          }else{
            this.edit({userName:this.username,status:"0"});
          }
        })
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'userName','agentUserName','status','startTime','endTime'))
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
          if (!err) {
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
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                //this.init();
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
      }
    }
  }
</script>

<style scoped>

</style>