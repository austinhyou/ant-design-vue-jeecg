<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">追加</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('注文履歴')">エクスポート</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">インポート</a-button>
      </a-upload>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>削除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 一括操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 選択済み <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">クリア</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        :scroll="{x:true}"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        class="j-table-force-nowrap"
        @change="handleTableChange">

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">写真なし</span>
          <img v-else :src="getImgView(text)" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">ファイルなし</span>
          <a-button
            v-else
            :ghost="true"
            type="primary"
            icon="download"
            size="small"
            @click="downloadFile(text)">
            ダウンロード
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">編集</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">最も <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleDetail(record)">詳細</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="削除しますか？" @confirm="() => handleDelete(record.id)">
                  <a>削除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <ord-customer-modal ref="modalForm" @ok="modalFormOk"></ord-customer-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import OrdCustomerModal from './modules/OrdCustomerModal'

  export default {
    name: 'OrdCustomerList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      OrdCustomerModal
    },
    data () {
      return {
        description: '注文履歴管理页面',
        // 表头
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
            title:'番号',
            align:"center",
            dataIndex: 'ordId'
          },
          {
            title:'会社名',
            align:"center",
            dataIndex: 'ordName'
          },
          {
            title:'注文番号',
            align:"center",
            dataIndex: 'ordNum'
          },
          {
            title:'連絡先',
            align:"center",
            dataIndex: 'ordPerson'
          },
          {
            title:'注文日付',
            align:"center",
            dataIndex: 'ordDate'
          },
          {
            title:'終了日',
            align:"center",
            dataIndex: 'ordFdate'
          },
          {
            title:'前渡金',
            align:"center",
            dataIndex: 'ordDeposit'
          },
          {
            title:'注文金額',
            align:"center",
            dataIndex: 'ordSum'
          },
          {
            title:'注文状況',
            align:"center",
            dataIndex: 'ordState'
          },
          {
            title:'営業員',
            align:"center",
            dataIndex: 'ordAssistant'
          },
          {
            title:'入力時間',
            align:"center",
            dataIndex: 'ordIntime'
          },
          {
            title:'操作記録',
            align:"center",
            dataIndex: 'ordNote'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            fixed:"right",
            width:147,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/cyu/ordCustomer/list",
          delete: "/cyu/ordCustomer/delete",
          deleteBatch: "/cyu/ordCustomer/deleteBatch",
          exportXlsUrl: "/cyu/ordCustomer/exportXls",
          importExcelUrl: "cyu/ordCustomer/importExcel",

        },
        dictOptions:{},
      }
    },
    created() {
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      },
    },
    methods: {
      initDictConfig(){
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>