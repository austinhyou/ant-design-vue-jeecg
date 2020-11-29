<template>
  <a-card :bordered="false">
    
    <!-- 操作ボタンエリア -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">追加</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('分類辞書')">エクスポート</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"  :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">インポート</a-button>
      </a-upload>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>削除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> バッチ操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- テーブルエリア-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 選択された <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>項目
        <a style="margin-left: 24px" @click="onClearSelected">クリア</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :expandedRowKeys="expandedRowKeys"
        @change="handleTableChange"
        @expand="handleExpand"
        v-bind="tableProps">
        
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">編集</a>
          <a-divider type="vertical" />
          <a-popconfirm title="削除を確認しますか？" @confirm="() => handleDelete(record)">
            <a>削除</a>
          </a-popconfirm>
          <a-divider type="vertical" />
          <a @click="handleAddSub(record)">部下を追加</a>
        </span>

      </a-table>
    </div>

    <sysCategory-modal ref="modalForm" @ok="modalFormOk"></sysCategory-modal>
  </a-card>
</template>

<script>

  import { getAction } from '@/api/manage'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SysCategoryModal from './modules/SysCategoryModal'
  import { deleteAction } from '@/api/manage'
  
  export default {
    name: "SysCategoryList",
    mixins:[JeecgListMixin],
    components: {
      SysCategoryModal
    },
    data () {
      return {
        description: '分類辞書管理ページ',
        // トップ
        columns: [
          {
            title:'種別名',
            align:"left",
            dataIndex: 'name'
          },
          {
            title:'分類コード',
            align:"left",
            dataIndex: 'code'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
        url: {
          list: "/sys/category/rootList",
          childList: "/sys/category/childList",
          delete: "/sys/category/delete",
          deleteBatch: "/sys/category/deleteBatch",
          exportXlsUrl: "/sys/category/exportXls",
          importExcelUrl: "sys/category/importExcel",
        },
        expandedRowKeys:[],
        hasChildrenField:"hasChild",
        pidField:"pid",
        dictOptions:{
        },
        subExpandedKeys:[],
      }
    },
    computed: {
      importExcelUrl(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      },
      tableProps() {
        let _this = this
        return {
          // リストアイテムが選択可能かどうか
          rowSelection: {
            selectedRowKeys: _this.selectedRowKeys,
            onChange: (selectedRowKeys) => _this.selectedRowKeys = selectedRowKeys
          }
        }
      }
    },
    methods: {
      loadData(arg){
        if(arg==1){
          this.ipagination.current=1
        }
        this.loading = true
        this.expandedRowKeys = []
        let params = this.getQueryParams()
        return new Promise((resolve) => {
          getAction(this.url.list,params).then(res=>{
            if(res.success){
              let result = res.result
              if(Number(result.total)>0){
                this.ipagination.total = Number(result.total)
                this.dataSource = this.getDataByResult(res.result.records)
                resolve()
              }else{
                this.ipagination.total=0
                this.dataSource=[]
              }
            }else{
              this.$message.warning(res.message)
            }
            this.loading = false
          })
        })
      },
      getDataByResult(result){
        return result.map(item=>{
          //サブノードがマークされているかどうかを確認します
          if(item[this.hasChildrenField]=='1'){
            let loadChild = { id: item.id+'_loadChild', name: 'loading...', isLoading: true }
            item.children = [loadChild]
          }
          return item
        })
      },
      handleExpand(expanded, record){
        // 拡張されているかどうかを確認します
        if (expanded) {
          this.expandedRowKeys.push(record.id)
          if (record.children.length>0 && record.children[0].isLoading === true) {
            let params = this.getQueryParams();//クエリ条件
            params[this.pidField] = record.id
            getAction(this.url.childList,params).then((res)=>{
              if(res.success){
                if(res.result && res.result.length>0){
                  record.children = this.getDataByResult(res.result)
                  this.dataSource = [...this.dataSource]
                }else{
                  record.children=''
                  record.hasChildrenField='0'
                }
              }else{
                this.$message.warning(res.message)
              }
            })
          }
        }else{
          let keyIndex = this.expandedRowKeys.indexOf(record.id)
          if(keyIndex>=0){
            this.expandedRowKeys.splice(keyIndex, 1);
          }
        }
      },
      initDictConfig(){
      },
      modalFormOk(formData,arr){
        if(!formData.id){
          this.addOk(formData,arr)
        }else{
          this.editOk(formData,this.dataSource)
          this.dataSource=[...this.dataSource]
        }
      },
      editOk(formData,arr){
        if(arr && arr.length>0){
          for(let i=0;i<arr.length;i++){
            if(arr[i].id==formData.id){
              arr[i]=formData
              break
            }else{
              this.editOk(formData,arr[i].children)
            }
          }
        }
      },
      async addOk(formData,arr){
        if(!formData[this.pidField]){
          this.loadData()
        }else{
          this.expandedRowKeys=[]
          console.log("22222",arr)
          for(let i of arr){
            await this.expandTreeNode(i)
          }
        }
      },
      expandTreeNode(nodeId){
        return new Promise((resolve,reject)=>{
          this.getFormDataById(nodeId,this.dataSource)
          let row = this.parentFormData
          this.expandedRowKeys.push(nodeId)
          let params = this.getQueryParams();//クエリ条件
          params[this.pidField] = nodeId
          getAction(this.url.childList,params).then((res)=>{
            console.log("11111",res)
            if(res.success){
              if(res.result && res.result.length>0){
                row.children = this.getDataByResult(res.result)
                this.dataSource = [...this.dataSource]
                resolve()
              }else{
                row.children=''
                row.hasChildrenField='0'
                reject()
              }
            }else{
              reject()
            }
          })
        })
      },
      getFormDataById(id,arr){
        if(arr && arr.length>0){
          for(let i=0;i<arr.length;i++){
            if(arr[i].id==id){
              this.parentFormData = arr[i]
            }else{
              this.getFormDataById(id,arr[i].children)
            }
          }
        }
      },
      handleAddSub(record){
        this.subExpandedKeys = [];
        this.getExpandKeysByPid(record.id,this.dataSource,this.dataSource)
        this.$refs.modalForm.subExpandedKeys = this.subExpandedKeys;
        this.$refs.modalForm.title = "サブ分類を追加";
        this.$refs.modalForm.edit({'pid':record.id});
        this.$refs.modalForm.disableSubmit = false;
      },
      handleDelete: function (record) {
        let that = this;
        deleteAction(that.url.delete, {id: record.id}).then((res) => {
          if (res.success) {
            if (record.pid && record.pid!='0') {
              let formData = {pid: record.pid};
              that.$message.success(res.message);
              that.subExpandedKeys = [];
              that.getExpandKeysByPid(record.pid, this.dataSource, this.dataSource)
              that.addOk(formData, this.subExpandedKeys.reverse())
            } else {
              that.loadData();
            }
          } else {
            that.$message.warning(res.message);
          }
        });
      },
      // サブ分類を追加するときにすべての親IDを取得する
      getExpandKeysByPid(pid,arr,all){
        if(pid && arr && arr.length>0){
          for(let i=0;i<arr.length;i++){
            if(arr[i].id==pid){
              this.subExpandedKeys.push(arr[i].id)
              this.getExpandKeysByPid(arr[i]['pid'],all,all)
            }else{
              this.getExpandKeysByPid(pid,arr[i].children,all)
            }
          }
        }
      },
      
       
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>