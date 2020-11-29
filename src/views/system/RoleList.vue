<template>
  <a-card :bordered="false" class="card-area">

    <!-- クエリエリア -->
    <div class="table-page-search-wrapper">
      <!-- 検索エリア -->
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="名前" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
              <a-input placeholder="クエリする名前を入力してください" v-model="queryParam.roleName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="10" :sm="12">
            <a-form-item label="作成時間" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
              <j-date v-model="queryParam.createTime_begin" :showTime="true" date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="開始時間を選択してください" ></j-date>
              <span style="width: 10px;">~</span>
              <j-date v-model="queryParam.createTime_end" :showTime="true" date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="終了時間を選択してください"></j-date>
            </a-form-item>
          </a-col>
          <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
            <a-col :md="6" :sm="24">
              <a-button type="primary" @click="searchQuery">クエリ</a-button>
              <a-button style="margin-left: 8px" @click="searchReset">リセット</a-button>
            </a-col>
          </span>
        </a-row>
      </a-form>
    </div>

    <!-- 操作ボタンエリア -->
    <div class="table-operator"  style="margin-top: 5px">
      <a-button @click="handleAdd" type="primary" icon="plus">追加</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('役割情報')">エクスポート</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">インポート</a-button>
      </a-upload>

      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>削除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          バッチ操作 <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!-- テーブルエリア-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 選択された&nbsp;<a style="font-weight: 600">{{ selectedRowKeys.length }}</a>項目&nbsp;&nbsp;
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

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">編集</a>
          <a-divider type="vertical" />

          <a-dropdown>
            <a class="ant-dropdown-link">
              もっと <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handlePerssion(record.id)">認証</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="削除を確認しますか？" @confirm="() => handleDelete(record.id)">
                  <a>削除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>


      </a-table>
    </div>
    <!-- テーブルエリア-end -->

    <!-- フォームエリア -->
    <role-modal ref="modalForm" @ok="modalFormOk"></role-modal>
    <user-role-modal ref="modalUserRole"></user-role-modal>
  </a-card>
</template>

<script>
  import RoleModal from './modules/RoleModal'
  import UserRoleModal from './modules/UserRoleModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'

  export default {
    name: "RoleList",
    mixins:[JeecgListMixin],
    components: {
      RoleModal,
      UserRoleModal,
      JDate
    },
    data () {
      return {

        description: '役割管理ページ',
        // クエリ条件
        queryParam: {roleName:'',},
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
            title: '役割名',
            align:"center",
            dataIndex: 'roleName'
          },
          {
            title: '役割番号',
            align:"center",
            dataIndex: 'roleCode'
          },
          {
            title: '備考',
            align:"center",
            dataIndex: 'description'
          },
          {
            title: '作成時間',
            dataIndex: 'createTime',
            align:"center",
            sorter: true
          },
          {
            title: '更新时间',
            dataIndex: 'updateTime',
            align:"center",
            sorter: true
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
        url: {
          list: "/sys/role/list",
          delete: "/sys/role/delete",
          deleteBatch: "/sys/role/deleteBatch",
          exportXlsUrl: "/sys/role/exportXls",
          importExcelUrl: "sys/role/importExcel",
        },
      }
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    methods: {
      handlePerssion: function(roleId){
       // alert(roleId);
        this.$refs.modalUserRole.show(roleId);
      },
      onChangeDate(date, dateString) {
        console.log(date, dateString);
      },
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>