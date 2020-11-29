<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form :form="form" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-item label="番号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['ordId']" placeholder="请输入番号" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="会社名" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['ordName']" placeholder="请输入会社名"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="注文番号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['ordNum']" placeholder="请输入注文番号" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="連絡先" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['ordPerson']" placeholder="请输入連絡先"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="注文日付" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['ordDate']" placeholder="请输入注文日付"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="終了日" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['ordFdate']" placeholder="请输入終了日"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="前渡金" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['ordDeposit']" placeholder="请输入前渡金"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="注文金額" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['ordSum']" placeholder="请输入注文金額"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="注文状況" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['ordState']" placeholder="请输入注文状況"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="営業員" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['ordAssistant']" placeholder="请输入営業員"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="入力時間" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['ordIntime']" placeholder="请输入入力時間"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="操作記録" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['ordNote']" placeholder="请输入操作記録"></a-input>
            </a-form-item>
          </a-col>
          <a-col v-if="showFlowSubmitButton" :span="24" style="text-align: center">
            <a-button @click="submitForm">提 交</a-button>
          </a-col>
        </a-row>
      </a-form>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction, getAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { validateDuplicateValue } from '@/utils/util'
  import JFormContainer from '@/components/jeecg/JFormContainer'

  export default {
    name: 'OrdCustomerForm',
    components: {
      JFormContainer,
    },
    props: {
      //流程表单data
      formData: {
        type: Object,
        default: ()=>{},
        required: false
      },
      //表单模式：true流程表单 false普通表单
      formBpm: {
        type: Boolean,
        default: false,
        required: false
      },
      //表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    data () {
      return {
        form: this.$form.createForm(this),
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        validatorRules: {
        },
        url: {
          add: "/cyu/ordCustomer/add",
          edit: "/cyu/ordCustomer/edit",
          queryById: "/cyu/ordCustomer/queryById"
        }
      }
    },
    computed: {
      formDisabled(){
        if(this.formBpm===true){
          if(this.formData.disabled===false){
            return false
          }
          return true
        }
        return this.disabled
      },
      showFlowSubmitButton(){
        if(this.formBpm===true){
          if(this.formData.disabled===false){
            return true
          }
        }
        return false
      }
    },
    created () {
      //如果是流程中表单，则需要加载流程表单data
      this.showFlowData();
    },
    methods: {
      add () {
        this.edit({});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'ordId','ordName','ordNum','ordPerson','ordDate','ordFdate','ordDeposit','ordSum','ordState','ordAssistant','ordIntime','ordNote'))
        })
      },
      //渲染流程表单数据
      showFlowData(){
        if(this.formBpm === true){
          let params = {id:this.formData.dataId};
          getAction(this.url.queryById,params).then((res)=>{
            if(res.success){
              this.edit (res.result);
            }
          });
        }
      },
      submitForm () {
        const that = this;
        // 触发表单验证
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
            console.log("表单提交数据",formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }
         
        })
      },
      popupCallback(row){
        this.form.setFieldsValue(pick(row,'ordId','ordName','ordNum','ordPerson','ordDate','ordFdate','ordDeposit','ordSum','ordState','ordAssistant','ordIntime','ordNote'))
      },
    }
  }
</script>