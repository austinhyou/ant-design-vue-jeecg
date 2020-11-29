<template>
  <a-modal
    :title="title"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    :destroyOnClose="true"
    cancelText="クローズ">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item label="親ノード" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-tree-select
            ref="treeSelect"
            placeholder="親ノードを選択してください"
            v-decorator="['pid', validatorRules.pid]"
            dict="sys_category,name,id"
            pidField="pid"
            pidValue="0">
          </j-tree-select>
        </a-form-item>
          
        <a-form-item label="種別名" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="[ 'name', validatorRules.name]" placeholder="種別名を入力してください"></a-input>
        </a-form-item>
          
        <!--<a-form-item label="タイプコード" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'code', validatorRules.code]" placeholder="タイプコードを入力してください"></a-input>
        </a-form-item>-->

        <!--<a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span style="font-size: 12px;color:red" slot="label">コードルール（注）</span>
          <span style="font-size: 12px;color:red">
            コード値のプレフィックスは親ノードと一致している必要があります。たとえば、親ノードのコードがA01の場合、現在のコードはA01で始まる必要があります。
          </span>
        </a-form-item>-->
          
        
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>

  import { httpAction,getAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import JTreeSelect from '@/components/jeecg/JTreeSelect'
  
  export default {
    name: "SysCategoryModal",
    components: { 
      JTreeSelect
    },
    data () {
      return {
        form: this.$form.createForm(this),
        title:"操作",
        width:800,
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

        confirmLoading: false,
        validatorRules:{
          code:{
            rules: [{
              required: true, message: 'タイプコードを入力してください!'
            },{
              validator: this.validateMyCode
            }]
          },
          pid:{},
          name:{rules: [{ required: true, message: 'タイプ名を入力してください！' }]}
        },
        url: {
          add: "/sys/category/add",
          edit: "/sys/category/edit",
          checkCode:"/sys/category/checkCode",
        },
        expandedRowKeys:[],
        pidField:"pid",
        subExpandedKeys:[]
     
      }
    },
    created () {
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
          this.form.setFieldsValue(pick(this.model,'pid','name','code'))
        })
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
            console.log("フォーム送信データ",formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.submitSuccess(formData)
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
      popupCallback(row){
        this.form.setFieldsValue(pick(row,'pid','name','code'))
      },
      submitSuccess(formData){
        if(!formData.id){
          let treeData = this.$refs.treeSelect.getCurrTreeData()
          this.expandedRowKeys=[]
          this.getExpandKeysByPid(formData[this.pidField],treeData,treeData)
          if(formData.pid && this.expandedRowKeys.length==0){
            this.expandedRowKeys = this.subExpandedKeys;
          }
          this.$emit('ok',formData,this.expandedRowKeys.reverse());
        }else{
          this.$emit('ok',formData);
      }
      },
      getExpandKeysByPid(pid,arr,all){
        if(pid && arr && arr.length>0){
          for(let i=0;i<arr.length;i++){
            if(arr[i].key==pid){
              this.expandedRowKeys.push(arr[i].key)
              this.getExpandKeysByPid(arr[i]['parentId'],all,all)
            }else{
              this.getExpandKeysByPid(pid,arr[i].children,all)
            }
          }
        }
      },
      validateMyCode(rule, value, callback){
        let params = {
          pid: this.form.getFieldValue('pid'),
          code: value
        }
        getAction(this.url.checkCode,params).then((res) => {
          if (res.success) {
            callback()
          } else {
            callback(res.message)
          }
        })
      },
      
      
    }
  }
</script>