<template>
  <a-modal
    title="パスワードを再設定する"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    cancelText="クローズ"
    style="top:20px;"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item label="ユーザーアカウント" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="ユーザーアカウントを入力してください" v-decorator="[ 'username', {}]" :readOnly="true"/>
        </a-form-item>

        <a-form-item label="ログインパスワード" :labelCol="labelCol" :wrapperCol="wrapperCol" hasFeedback >
          <a-input type="password" placeholder="ログインパスワードを入力してください" v-decorator="[ 'password', validatorRules.password]" />
        </a-form-item>

        <a-form-item label="パスワードを確認する" :labelCol="labelCol" :wrapperCol="wrapperCol" hasFeedback >
          <a-input type="password" @blur="handleConfirmBlur" placeholder="ログインパスワードを再入力してください" v-decorator="[ 'confirmpassword', validatorRules.confirmpassword]"/>
        </a-form-item>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import {changePassword} from '@/api/api'

  export default {
    name: "PasswordModal",
    data () {
      return {
        visible: false,
        confirmLoading: false,
        confirmDirty: false,
        validatorRules:{
          password:{
            rules: [{
              required: true,
              pattern:/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,./]).{8,}$/,
              message: 'パスワードは8桁、大文字と小文字、特殊記号で構成されています。'
            }, {
              validator: this.validateToNextPassword,
            }],
          },
          confirmpassword:{
            rules: [{
              required: true, message: 'ログインパスワードを再入力してください！',
            }, {
              validator: this.compareToFirstPassword,
            }],
          },
        },

        model: {},

        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        form:this.$form.createForm(this)
      }
    },
    created () {
      console.log("created");
    },

    methods: {
      show (username) {
        this.form.resetFields();
        this.visible = true;
        this.model.username = username;
        this.$nextTick(() => {
          this.form.setFieldsValue({username:username});
        });
      },
      close () {
        this.$emit('close');
        this.visible = false;
        this.disableSubmit = false;
        this.selectedRole = [];
      },
      handleSubmit () {
        // フォームの検証をトリガーする
        this.form.validateFields((err, values) => {
          if (!err) {
            this.confirmLoading = true;
            let formData = Object.assign(this.model, values);
            changePassword(formData).then((res)=>{
              if(res.success){
                this.$message.success(res.message);
                this.$emit('ok');
              }else{
                this.$message.warning(res.message);
              }
            }).finally(() => {
              this.confirmLoading = false;
              this.close();
            });
          }
        })
      },
      handleCancel () {
        this.close()
      },
      validateToNextPassword  (rule, value, callback) {
        const form = this.form;
        const confirmpassword=form.getFieldValue('confirmpassword');
        console.log("confirmpassword==>",confirmpassword);
        if (value && confirmpassword && value !== confirmpassword) {
          callback('2回入力したパスワードが違います！');
        }
        if (value && this.confirmDirty) {
          form.validateFields(['confirm'], { force: true })
        }
        callback();
      },
      compareToFirstPassword  (rule, value, callback) {
        const form = this.form;
        if (value && value !== form.getFieldValue('password')) {
          callback('2回入力したパスワードが違います！');
        } else {
          callback()
        }
      },
      handleConfirmBlur  (e) {
        const value = e.target.value
        this.confirmDirty = this.confirmDirty || !!value
      }
    }
  }
</script>