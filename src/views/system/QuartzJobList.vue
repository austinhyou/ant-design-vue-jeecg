<template>
  <a-card :bordered="false">

    <!-- クエリエリア -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="10">
            <a-form-item label="タスククラス名">
              <a-input placeholder="タスククラス名を入力してください" v-model="queryParam.jobClassName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="10">
            <a-form-item label="タスクステータス">
              <a-select style="width: 220px" v-model="queryParam.status" placeholder="ステータスを選択してください">
                <a-select-option value="">すべて</a-select-option>
                <a-select-option value="0">正常</a-select-option>
                <a-select-option value="-1">停止</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="10" >
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">クエリ</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">リセット</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作ボタンエリア -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">追加</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('時限タスク情報')">エクスポート</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">インポート</a-button>
      </a-upload>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>削除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">バッチ操作<a-icon type="down" /></a-button>
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
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">

        <!-- 長い文字列の切り捨ての省略形の表示-->
        <span slot="description" slot-scope="text">
          <j-ellipsis :value="text" :length="20" />
        </span>
        <span slot="parameterRender" slot-scope="text">
          <j-ellipsis :value="text" :length="20" />
        </span>


        <span slot="action" slot-scope="text, record">
          <a @click="resumeJob(record)" v-if="record.status==-1">起動</a>
          <a @click="pauseJob(record)" v-if="record.status==0">停止</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">もっと <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item><a @click="executeImmediately(record)">すぐに実行</a></a-menu-item>
              <a-menu-item><a @click="handleEdit(record)">編集</a></a-menu-item>
              <a-menu-item>
                <a-popconfirm title="削除を確認しますか？" @confirm="() => handleDelete(record.id)">
                  <a>削除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

        <!-- 状態レンダリングテンプレート -->
        <template slot="customRenderStatus" slot-scope="status">
          <a-tag v-if="status==0" color="green">起動しました</a-tag>
          <a-tag v-if="status==-1" color="orange">停止しました</a-tag>
        </template>
      </a-table>
    </div>
    <!-- テーブルエリア-end -->

    <!-- フォームエリア -->
    <quartzJob-modal ref="modalForm" @ok="modalFormOk"></quartzJob-modal>
  </a-card>
</template>

<script>
  import QuartzJobModal from './modules/QuartzJobModal'
  import { getAction } from '@/api/manage'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JEllipsis from "@/components/jeecg/JEllipsis";

  export default {
    name: "QuartzJobList",
    mixins:[JeecgListMixin],
    components: {
      QuartzJobModal,
      JEllipsis
    },
    data () {
      return {
        description: '時限タスクオンライン管理',
        // クエリ条件
        queryParam: {},
        // トップ
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title: 'タスククラス名',
            align:"center",
            dataIndex: 'jobClassName',
            sorter: true,
/*            customRender:function (text) {
              return "*"+text.substring(9,text.length);
            }*/
          },
          {
            title: 'cron式',
            align:"center",
            dataIndex: 'cronExpression'
          },
          {
            title: 'パラメータ',
            align:"center",
            width: 150,
            dataIndex: 'parameter',
            scopedSlots: {customRender: 'parameterRender'},
          },
          {
            title: '説明',
            align:"center",
            width: 250,
            dataIndex: 'description',
            scopedSlots: {customRender: 'description'},
          },
          {
            title: '状態',
            align:"center",
            dataIndex: 'status',
            scopedSlots: { customRender: 'customRenderStatus' },
            filterMultiple: false,
            filters: [
              { text: '起動しました', value: '0' },
              { text: '停止しました', value: '-1' },
            ]
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            width:180,
            scopedSlots: { customRender: 'action' },
          }
        ],
		url: {
          list: "/sys/quartzJob/list",
          delete: "/sys/quartzJob/delete",
          deleteBatch: "/sys/quartzJob/deleteBatch",
          pause: "/sys/quartzJob/pause",
          resume: "/sys/quartzJob/resume",
          exportXlsUrl: "sys/quartzJob/exportXls",
          importExcelUrl: "sys/quartzJob/importExcel",
          execute: "sys/quartzJob/execute"
        },
      }
    },
    computed: {
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },

    methods: {

      //スクリーニングをすればhandleTableChangeを書き直す必要があります
      handleTableChange(pagination, filters, sorter) {
        //変更のページング、並べ替え、およびスクリーニング変化時に触発されます
        //TODO スクリーニング
        if (Object.keys(sorter).length > 0) {
          this.isorter.column = sorter.field;
          this.isorter.order = "ascend" == sorter.order ? "asc" : "desc"
        }
        //このスクリーニング方法は、単一選択のみをサポートします
        this.filters.status = filters.status[0];
        this.ipagination = pagination;
        this.loadData();
      },
      pauseJob: function(record){
        var that = this;
        //時限タスクを一時停止します
        this.$confirm({
          title:"停止を確認する",
          content:"選択したタスクを停止するかどうか？",
          onOk: function(){
            getAction(that.url.pause,{jobClassName:record.jobClassName}).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.loadData();
                that.onClearSelected();
              }else{
                that.$message.warning(res.message);
              }
            });
          }
        });

      },
      resumeJob: function(record){
        var that = this;
        //時限タスクを再開します
        this.$confirm({
          title:"起動を確認する",
          content:"選択したタスクを起動するかどうか？",
          onOk: function(){
            getAction(that.url.resume,{jobClassName:record.jobClassName}).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.loadData();
                that.onClearSelected();
              }else{
                that.$message.warning(res.message);
              }
            });
          }
        });
      },
      executeImmediately(record){
        var that = this;
        //時限タスクをすぐに実行する
        this.$confirm({
          title:"プロンプトの確認",
          content:"タスクをすぐに実行するかどうか？",
          onOk: function(){
            getAction(that.url.execute,{id:record.id}).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.loadData();
                that.onClearSelected();
              }else{
                that.$message.warning(res.message);
              }
            });
          }
        });
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>