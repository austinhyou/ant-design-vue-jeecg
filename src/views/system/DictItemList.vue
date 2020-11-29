<template>
  <a-card :bordered="false">
    <!-- 引き出し -->
    <a-drawer
      title="辞書リスト"
      :width="screenWidth"
      @close="onClose"
      :visible="visible"
    >
      <!-- 引き出しコンテンツのborder -->
      <div
        :style="{
          padding:'10px',
          border: '1px solid #e9e9e9',
          background: '#fff',
        }">

        <div class="table-page-search-wrapper">
          <a-form layout="inline" :form="form" @keyup.enter.native="searchQuery">
            <a-row :gutter="10">
              <a-col :md="8" :sm="12">
                <a-form-item label="名前">
                  <a-input style="width: 120px;" placeholder="名前を入力してください" v-model="queryParam.itemText"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="9" :sm="24">
                <a-form-item label="状態" style="width: 170px" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-select
                    placeholder="選んでください"
                    v-model="queryParam.status"
                  >
                    <a-select-option value="1">正常</a-select-option>
                    <a-select-option value="0">無効化</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="7" :sm="24">
              <span style="float: left;" class="table-page-search-submitButtons">
                <a-button type="primary" @click="searchQuery">検索する</a-button>
                <a-button type="primary" @click="searchReset" style="margin-left: 8px">リセット</a-button>
              </span>
              </a-col>
            </a-row>
            <a-row>
              <a-col :md="2" :sm="24">
                <a-button style="margin-bottom: 10px" type="primary" @click="handleAdd">追加</a-button>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <div>
          <a-table
            ref="table"
            rowKey="id"
            size="middle"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="ipagination"
            :loading="loading"
            @change="handleTableChange"
          >

          <span slot="action" slot-scope="text, record">
            <a @click="handleEdit(record)">編集</a>
            <a-divider type="vertical"/>
            <a-popconfirm title="削除を確認しますか？" @confirm="() => handleDelete(record.id)">
              <a>削除</a>
            </a-popconfirm>
          </span>

          </a-table>
        </div>
      </div>
    </a-drawer>
    <dict-item-modal ref="modalForm" @ok="modalFormOk"></dict-item-modal> <!-- 辞書データ -->
  </a-card>
</template>

<script>
  import pick from 'lodash.pick'
  import {filterObj} from '@/utils/util';
  import DictItemModal from './modules/DictItemModal'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'

  export default {
    name: "DictItemList",
    mixins: [JeecgListMixin],
    components: {DictItemModal},
    data() {
      return {
        columns: [
          {
            title: '名前',
            align: "center",
            dataIndex: 'itemText',
          },
          {
            title: 'データ値',
            align: "center",
            dataIndex: 'itemValue',
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: "center",
            scopedSlots: {customRender: 'action'},
          }
        ],
        queryParam: {
          dictId: "",
          dictName: "",
          itemText: "",
          delFlag: "1",
          status: [],
        },
        title: "操作",
        visible: false,
        screenWidth: 800,
        model: {},
        dictId: "",
        status: 1,
        labelCol: {
          xs: {span: 5},
          sm: {span: 5},
        },
        wrapperCol: {
          xs: {span: 12},
          sm: {span: 12},
        },
        form: this.$form.createForm(this),
        validatorRules: {
          itemText: {rules: [{required: true, message: '名前を入力してください!'}]},
          itemValue: {rules: [{required: true, message: 'データ値を入力してください'}]},
        },
        url: {
          list: "/sys/dictItem/list",
          delete: "/sys/dictItem/delete",
          deleteBatch: "/sys/dictItem/deleteBatch",
        },
      }
    },
    created() {
      // ページの初期化時に、画面サイズに応じて引き出しの幅を設定します
      this.resetScreenSize();
    },
    methods: {
      add(dictId) {
        this.dictId = dictId;
        this.edit({});
      },
      edit(record) {
        if (record.id) {
          this.dictId = record.id;
        }
        this.queryParam = {}
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.model.dictId = this.dictId;
        this.model.status = this.status;
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model, 'itemText', 'itemValue'))
        });
        // 他のモジュールがこのモジュールを呼び出すときは、このメソッドを呼び出して辞書データをロードします
        this.loadData();
      },

      getQueryParams() {
        var param = Object.assign({}, this.queryParam);
        param.dictId = this.dictId;
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        if (this.superQueryParams) {
          param['superQueryParams'] = encodeURI(this.superQueryParams)
          param['superQueryMatchType'] = this.superQueryMatchType
        }
        return filterObj(param);
      },

      // 辞書データを追加する
      handleAdd() {
        this.$refs.modalForm.add(this.dictId);
        this.$refs.modalForm.title = "追加";
      },
      showDrawer() {
        this.visible = true
      },
      onClose() {
        this.visible = false
        this.form.resetFields();
        this.dataSource = [];
      },
      // 引き出しの幅は画面サイズによって異なります
      resetScreenSize() {
        let screenWidth = document.body.clientWidth;
        if (screenWidth < 600) {
          this.screenWidth = screenWidth;
        } else {
          this.screenWidth = 600;
        }
      },
    }
  }
</script>
<style scoped>
</style>