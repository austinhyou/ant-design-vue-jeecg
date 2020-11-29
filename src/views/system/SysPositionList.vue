<template>
  <a-card :bordered="false">

    <!-- クエリエリア -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="8">
            <a-form-item label="職務番号">
              <a-input placeholder="職務番号を入力してください" v-model="queryParam.code"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="職務名">
              <a-input placeholder="職務名を入力してください" v-model="queryParam.name"></a-input>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="ランク">
                <j-dict-select-tag v-model="queryParam.postRank" placeholder="ランクを選択してください" dictCode="position_rank"/>
              </a-form-item>
            </a-col>

          </template>
          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">クエリ</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">リセット</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '畳む' : '展開する' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作ボタンエリア -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">追加</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('職務表')">エクスポート</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">インポート</a-button>
      </a-upload>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel">
            <a-icon type="delete"/>
            削除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> バッチ操作
          <a-icon type="down"/>
        </a-button>
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

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">編集</a>

          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">もっと <a-icon type="down"/></a>
            <a-menu slot="overlay">
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
    <sysPosition-modal ref="modalForm" @ok="modalFormOk"></sysPosition-modal>
  </a-card>
</template>

<script>
  import SysPositionModal from './modules/SysPositionModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDictSelectTag from '@/components/dict/JDictSelectTag'

  export default {
    name: 'SysPositionList',
    mixins: [JeecgListMixin],
    components: {
      SysPositionModal,
      JDictSelectTag
    },
    data() {
      return {
        description: '職務表管理ページ',
        // トップ
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            customRender: function (t, r, index) {
              return parseInt(index) + 1
            }
          },
          {
            title: '職務番号',
            align: 'center',
            dataIndex: 'code'
          },
          {
            title: '職務名',
            align: 'center',
            dataIndex: 'name'
          },
          {
            title: 'ランク',
            align: 'center',
            dataIndex: 'postRank_dictText'
          },
          // {
          //   title: '会社ID',
          //   align: 'center',
          //   dataIndex: 'companyId'
          // },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' },
          }
        ],
        url: {
          list: '/sys/position/list',
          delete: '/sys/position/delete',
          deleteBatch: '/sys/position/deleteBatch',
          exportXlsUrl: '/sys/position/exportXls',
          importExcelUrl: '/sys/position/importExcel',
        },
      }
    },
    computed: {
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>