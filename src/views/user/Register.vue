<template>
  <div class="main user-layout-register">
    <h3><span>登録</span></h3>
    <a-form ref="formRegister" :autoFormCreate="(form)=>{this.form = form}" id="formRegister">
      <a-form-item
        fieldDecoratorId="username"
        :fieldDecoratorOptions="{rules: [{ required: true, message: 'ユーザー名を空にすることはできません'}, { validator: this.checkUsername }], validateTrigger: ['change', 'blur'], validateFirst: true}">
        <a-input size="" type="text" autocomplete="false" placeholder="ユーザー名を入力してください"></a-input>
      </a-form-item>

      <a-popover placement="rightTop" trigger="click" :visible="state.passwordLevelChecked">
        <template slot="content">
          <div :style="{ width: '240px' }">
            <div :class="['user-register', passwordLevelClass]">强さ程度：<span>{{ passwordLevelName }}</span></div>
            <a-progress :percent="state.percent" :showInfo="false" :strokeColor=" passwordLevelColor "/>
            <div style="margin-top: 10px;">
              <span>8文字以上入力してください。 推測しやすいパスワードは使用しないでください。</span>
            </div>
          </div>
        </template>
        <a-form-item
          fieldDecoratorId="password"
          :fieldDecoratorOptions="{rules: [{ required: false}, { validator: this.handlePasswordLevel }], validateTrigger: ['change', 'blur'], validateFirst: true}">
          <a-input size="" type="password" @click="handlePasswordInputClick" autocomplete="false" placeholder="大文字と小文字を区別する8桁以上のパスワード"></a-input>
        </a-form-item>
      </a-popover>

      <a-form-item
        fieldDecoratorId="password2"
        :fieldDecoratorOptions="{rules: [{ required: true, message: '大文字と小文字を区別する8桁以上のパスワード' }, { validator: this.handlePasswordCheck }], validateTrigger: ['change', 'blur'], validateFirst: true}">

        <a-input size="" type="password" autocomplete="false" placeholder="パスワードを認証する"></a-input>
      </a-form-item>
      <a-form-item
        fieldDecoratorId="email"
        :fieldDecoratorOptions="{rules: [{ required: true, type: 'email', message: '正しいメールアドレスを入力してください' }, { validator: this.handleEmailCheck }], validateTrigger: ['change', 'blur'], validateFirst: true}">
        <a-input size="" type="text" placeholder="メールアドレス"></a-input>
      </a-form-item>
      <a-form-item
        fieldDecoratorId="mobile"
        :fieldDecoratorOptions="{rules: [{ required: true, pattern: /^1[3456789]\d{9}$/, message: '有効な電話番号を入力して下さい' }, { validator: this.handlePhoneCheck } ], validateTrigger: ['change', 'blur'], validateFirst: true}">
        <a-input size="" placeholder="11桁の携帯電話番号">
          <a-select slot="addonBefore" size="large" defaultValue="+86">
            <a-select-option value="+81">+81</a-select-option>
            <a-select-option value="+86">+86</a-select-option>
          </a-select>
        </a-input>
      </a-form-item>
      <!--<a-input-group size="large" compact>
            <a-select style="width: 20%" size="large" defaultValue="+86">
              <a-select-option value="+86">+86</a-select-option>
              <a-select-option value="+87">+87</a-select-option>
            </a-select>
            <a-input style="width: 80%" size="large" placeholder="11桁の携帯電話番号"></a-input>
          </a-input-group>-->

      <a-row :gutter="16">
        <a-col class="gutter-row" :span="16">
          <a-form-item
            fieldDecoratorId="captcha"
            :fieldDecoratorOptions="{rules: [{ required: true, message: '確認コードを入力してください' }], validateTrigger: 'blur', validateFirst: true}">
            <a-input size="large" type="text" placeholder="確認コード">
              <a-icon slot="prefix" type="mail" :style="{ color: 'rgba(0,0,0,.25)' }"/>
            </a-input>
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="8">
          <a-button
            class="getCaptcha"
            size="large"
            :disabled="state.smsSendBtn"
            @click.stop.prevent="getCaptcha"
            v-text="!state.smsSendBtn && 'コード取得'||(state.time+' s')"></a-button>
        </a-col>
      </a-row>

      <a-form-item>
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="register-button"
          :loading="registerBtn"
          @click.stop.prevent="handleSubmit"
          :disabled="registerBtn">登録
        </a-button>
        <router-link class="login" :to="{ name: 'login' }">既存のアカウントでログインします</router-link>
      </a-form-item>

    </a-form>
  </div>
</template>

<script>
  import {mixinDevice} from '@/utils/mixin.js'
  import {getSmsCaptcha} from '@/api/login'
  import {getAction, postAction} from '@/api/manage'
  import {checkOnlyUser} from '@/api/api'

  const levelNames = {
    0: '低',
    1: '低',
    2: '中',
    3: '高'
  }
  const levelClass = {
    0: 'error',
    1: 'error',
    2: 'warning',
    3: 'success'
  }
  const levelColor = {
    0: '#ff0000',
    1: '#ff0000',
    2: '#ff7e05',
    3: '#52c41a',
  }
  export default {
    name: "Register",
    components: {},
    mixins: [mixinDevice],
    data() {
      return {
        form: null,

        state: {
          time: 60,
          smsSendBtn: false,
          passwordLevel: 0,
          passwordLevelChecked: false,
          percent: 10,
          progressColor: '#FF0000'
        },
        registerBtn: false
      }
    },
    computed: {
      passwordLevelClass() {
        return levelClass[this.state.passwordLevel]
      },
      passwordLevelName() {
        return levelNames[this.state.passwordLevel]
      },
      passwordLevelColor() {
        return levelColor[this.state.passwordLevel]
      }
    },
    methods: {
      checkUsername(rule, value, callback) {
        var params = {
          username: value,
        };
        checkOnlyUser(params).then((res) => {
          if (res.success) {
            callback()
          } else {
            callback("ユーザー名は既に存在します!")
          }
        })
      },
      handleEmailCheck(rule, value, callback) {
        var params = {
          email: value,
        };
        checkOnlyUser(params).then((res) => {
          if (res.success) {
            callback()
          } else {
            callback("メールアドレスは既に存在します!")
          }
        })
      },
      handlePasswordLevel(rule, value, callback) {

        let level = 0
        let reg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,./]).{8,}$/;
        if (!reg.test(value)) {
          callback(new Error('パスワードは8桁、大文字と小文字、および特殊記号で構成されます!'))
        }
        // 文字列に数字があるかどうかを確認します
        if (/[0-9]/.test(value)) {
          level++
        }
        // 文字列に文字があるかどうかを確認します
        if (/[a-zA-Z]/.test(value)) {
          level++
        }
        // 文字列に特別な記号があるかどうかを確認します
        if (/[^0-9a-zA-Z_]/.test(value)) {
          level++
        }
        this.state.passwordLevel = level
        this.state.percent = level * 30
        if (level >= 2) {
          if (level >= 3) {
            this.state.percent = 100
          }
          callback()
        } else {
          if (level === 0) {
            this.state.percent = 10
          }
          callback(new Error('パスワードが强さ程度足りません'))
        }
      },

      handlePasswordCheck(rule, value, callback) {
        let password = this.form.getFieldValue('password')
        //console.log('value', value)
        if (value === undefined) {
          callback(new Error('パスワードを入力してください'))
        }
        if (value && password && value.trim() !== password.trim()) {
          callback(new Error('パスワードに一貫性がありません'))
        }
        callback()
      },

      handlePhoneCheck(rule, value, callback) {
        var params = {
          phone: value,
        };
        checkOnlyUser(params).then((res) => {
          if (res.success) {
            callback()
          } else {
            callback("パスワードに一貫性がありません!")
          }
        })
      },

      handlePasswordInputClick() {
        if (!this.isMobile()) {
          this.state.passwordLevelChecked = true
          return;
        }
        this.state.passwordLevelChecked = false
      },

      handleSubmit() {
        this.form.validateFields((err, values) => {
          if (!err) {
            var register = {
              username: values.username,
              password: values.password,
              email: values.email,
              phone: values.mobile,
              smscode: values.captcha
            };
            postAction("/sys/user/register", register).then((res) => {
              if (!res.success) {
                this.registerFailed(res.message)
              } else {
                this.$router.push({name: 'registerResult', params: {...values}})
              }
            })
          }
        })
      },

      getCaptcha(e) {
        e.preventDefault()
        let that = this
        this.form.validateFields(['mobile'], {force: true}, (err, values) => {
            if (!err) {
              this.state.smsSendBtn = true;
              let interval = window.setInterval(() => {
                if (that.state.time-- <= 0) {
                  that.state.time = 60;
                  that.state.smsSendBtn = false;
                  window.clearInterval(interval);
                }
              }, 1000);
              const hide = this.$message.loading('確認コードを送信しています..', 0);
              const params = {
                mobile: values.mobile,
                smsmode: "1"
              };
              postAction("/sys/sms", params).then((res) => {
                if (!res.success) {
                  this.registerFailed(res.message);
                  setTimeout(hide, 0);
                }
                setTimeout(hide, 500);
              }).catch(err => {
                setTimeout(hide, 1);
                clearInterval(interval);
                that.state.time = 60;
                that.state.smsSendBtn = false;
                this.requestFailed(err);
              });
            }
          }
        );
      },
      registerFailed(message) {
        this.$notification['error']({
          message: "登録に失敗しました",
          description: message,
          duration: 2,
        });

      },
      requestFailed(err) {
        this.$notification['error']({
          message: 'エラー',
          description: ((err.response || {}).data || {}).message || "リクエストにエラーがありました。しばらくしてからもう一度お試しください",
          duration: 4,
        });
        this.registerBtn = false;
      },
    },
    watch: {
      'state.passwordLevel'(val) {
        console.log(val)

      }
    }
  }
</script>
<style lang="less">
  .user-register {

    &.error {
      color: #ff0000;
    }

    &.warning {
      color: #ff7e05;
    }

    &.success {
      color: #52c41a;
    }

  }

  .user-layout-register {
    .ant-input-group-addon:first-child {
      background-color: #fff;
    }
  }
</style>
<style lang="less" scoped>
  .user-layout-register {

    & > h3 {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .getCaptcha {
      display: block;
      width: 100%;
      height: 40px;
    }

    .register-button {
      width: 50%;
    }

    .login {
      float: right;
      line-height: 40px;
    }
  }
</style>