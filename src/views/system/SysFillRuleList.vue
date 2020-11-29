<template>
  <a-card :bordered="false">

    <!-- クエリエリア -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="ルール名">
              <a-input placeholder="ルール名を入力してください" v-model="queryParam.ruleName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="ルールコード">
              <a-input placeholder="ルールコードを入力してください" v-model="queryParam.ruleCode"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
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
      <a-button type="primary" icon="download" @click="handleExportXls('値記入規則')">エクスポート</a-button>
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
    <a-alert type="info" showIcon style="margin-bottom: 16px;">
      <template slot="message">
        <span>選択された</span>
        <a style="font-weight: 600;padding: 0 4px;">{{ selectedRowKeys.length }}</a>
        <span>項目</span>
        <template v-if="selectedRowKeys.length>0">
          <a-divider type="vertical"/>
          <a @click="onClearSelected">クリア</a>
        </template>
      </template>
    </a-alert>

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
              <a-menu-item @click="handleTest(record)">
                機能テスト
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
    <!-- テーブルエリア-end -->

    <!-- フォームエリア -->
    <sys-fill-rule-modal ref="modalForm" @ok="modalFormOk"/>
  </a-card>
</template>

<script>
  import { getAction } from '@/api/manage'
  import SysFillRuleModal from './modules/SysFillRuleModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'

  export default {
    name: 'SysFillRuleList',
    mixins: [JeecgListMixin],
    components: { SysFillRuleModal },
    data() {
      return {
        description: '値記入規則管理ページ',
        // トップ
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            customRender: (t, r, index) => 1 + index
          },
          {
            title: 'ルール名',
            align: 'center',
            dataIndex: 'ruleName'
          },
          {
            title: 'ルールコード',
            align: 'center',
            dataIndex: 'ruleCode'
          },
          {
            title: 'ルール実装クラス',
            align: 'center',
            dataIndex: 'ruleClass'
          },
          {
            title: 'ルールパラメータ',
            align: 'center',
            dataIndex: 'ruleParams'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' },
          }
        ],
        url: {
          list: '/sys/fillRule/list',
          test: '/sys/fillRule/testFillRule',
          delete: '/sys/fillRule/delete',
          deleteBatch: '/sys/fillRule/deleteBatch',
          exportXlsUrl: '/sys/fillRule/exportXls',
          importExcelUrl: '/sys/fillRule/importExcel',
        },
      }
    },
    computed: {
      importExcelUrl() {
        return `${window._CONFIG['domianURL']}${this.url.importExcelUrl}`
      }
    },
    methods: {
      handleTest(record) {
        let closeLoading = this.$message.loading('生成中...', 0)

        getAction(this.url.test, {
          ruleCode: record.ruleCode
        }).then(res => {
          if (res.success) {
            this.$info({
              title: '値記入規則機能テスト',
              content: '生成結果：' + res.result
            })
          } else {
            this.$message.warn(res.message)
          }
        }).finally(() => {
          closeLoading()
        })
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>