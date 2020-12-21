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
      <a-button type="primary" icon="download" @click="handleExportXls('顧客情報')">エクスポート</a-button>
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
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 選択済み <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>行
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
                <a @click="handleDetail(record)">詳細情報</a>
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

    <cus-customer-modal ref="modalForm" @ok="modalFormOk"></cus-customer-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import CusCustomerModal from './modules/CusCustomerModal'

  export default {
    name: 'CusCustomerList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      CusCustomerModal
    },
    data () {
      return {
        description: '顧客情報管理页面',
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
            title:'顧客ID',
            align:"center",
            dataIndex: 'cusId'
          },
          {
            title:'顧客名',
            align:"center",
            dataIndex: 'cusName'
          },
          {
              title:'会社住所',
            align:"center",
            dataIndex: 'cusAddress'
          },
          {
            title:'連絡先',
            align:"center",
            dataIndex: 'cusPername'
          },
          {
            title:'電話番号',
            align:"center",
            dataIndex: 'cusPhonenum'
          },
          {
            title:'項目分類',
            align:"center",
            dataIndex: 'cusSort_dictText'
          },
          {
            title:'顧客級別',
            align:"center",
            dataIndex: 'cusSen_dictText'
          },
          {
            title:'顧客タイプ',
            align:"center",
            dataIndex: 'cusType'
          },
          {
            title:'項目内容',
            align:"center",
            dataIndex: 'cusHeadline'
          },
          {
            title:'備考',
            align:"center",
            dataIndex: 'cusMemos'
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
          list: "/ko/cusCustomer/list",
          delete: "/ko/cusCustomer/delete",
          deleteBatch: "/ko/cusCustomer/deleteBatch",
          exportXlsUrl: "/ko/cusCustomer/exportXls",
          importExcelUrl: "ko/cusCustomer/importExcel",

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