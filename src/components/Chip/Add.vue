<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>芯片管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加芯片</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示 -->
      <el-alert
        title="添加芯片信息"
        type="info"
        center
        show-icon
        :closable="false"
      ></el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <!-- <el-step title="芯片参数"></el-step> -->
        <!-- <el-step title="芯片属性"></el-step> -->
        <el-step title="芯片内容"></el-step>

        <el-step title="完成"></el-step>
      </el-steps>

      <!-- Tab栏 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs v-model="activeIndex" :tab-position="'left'">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="芯片名称" prop="chip_name">
              <el-input v-model="addForm.chip_name"></el-input>
            </el-form-item>
            <el-form-item label="芯片价格" prop="chip_price">
              <el-input v-model="addForm.chip_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="芯片数量" prop="chip_number">
              <el-input v-model="addForm.chip_number" type="number"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="芯片内容" name="2">
            <el-form-item label="芯片参数" prop="chip_desc">
              <el-input v-model="addForm.chip_desc"></el-input>
            </el-form-item>
            <el-form-item label="CT值阈值" prop="color_mumber">
              <el-input-number
                v-model="addForm.color_mumber"
                :min="1"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="芯片曲线虚实" prop="line">
              <el-radio v-model="addForm.line" label="1">虚</el-radio>
              <el-radio v-model="addForm.line" label="0">实</el-radio>
              <!-- <el-radio-group v-model="addForm.line">
                <el-radio :label="real">实</el-radio>
                <el-radio :label="virtual">虚</el-radio>
              </el-radio-group> -->
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="芯片图片" name="4">
            <!-- action: 图片上传的API接口地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headerObj"
              list-type="picture"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
            <div style="height:50px"></div>

            <el-button type="primary" class="btnAdd" @click="addChip"
              >添加芯片</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%"
    >
      <img :src="picPreviewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
export default {
  data() {
    return {
      // 曲线颜色选择
      // options: [
      //   {
      //     value: 1,
      //     label: "红"
      //   },
      //   {
      //     value: 2,
      //     label: "绿"
      //   },
      //   {
      //     value: 3,
      //     label: "黄"
      //   },
      //   {
      //     value: 4,
      //     label: "橙"
      //   },
      //   {
      //     value: 5,
      //     label: "蓝"
      //   }
      // ],
      // 步骤条默认激活 与左侧Tab联动
      activeIndex: "0",
      // 添加芯片的表单对象
      addForm: {
        chip_name: "",
        chip_price: 0,
        chip_desc: "",
        chip_number: 0,
        // 芯片所属分类数组
        total_cat: 1,
        // 图片的数组
        pics: [],
        // 芯片详情描述
        line: 1,
        color_mumber: 1,
        attrs: []
      },
      addFormRules: {
        chip_name: [
          { required: true, message: "请输入芯片名称", trigger: "blur" }
        ],
        chip_price: [
          { required: true, message: "请输入芯片价格", trigger: "blur" }
        ],
        color_mumber: [
          { required: true, message: "请选择曲线颜色", trigger: "blur" }
        ],
        line: [{ required: true, message: "请选择曲线颜色", trigger: "blur" }],
        chip_number: [
          { required: true, message: "请输入芯片数量", trigger: "blur" }
        ]
      },
      // 芯片列表
      cateList: [],
      // 级联选择器配置
      cascaderProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 图片上传地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 图片上传组件的请求对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      picPreviewPath: "",
      // 图片预览对话框
      previewDialogVisible: false
    };
  },
  created() {
    // this.getCateList();
  },
  computed: {
    getCateId() {
      if (this.addForm.total_cat.length === 1) {
        return this.addForm.total_cat[0];
      }
      return null;
    }
  },
  methods: {
    handleChange() {
      console.log(this.addForm.total_cat);
      if (this.addForm.total_cat.length !== 1) {
        this.addForm.total_cat = [];
      }
    },
    // beforeTabLeave (activeName, odlActiveName) {
    //   // 未选中芯片分类阻止Tab标签跳转
    //   if (odlActiveName === '0' && this.addForm.total_cat.length !== 1) {
    //     this.$message.error('请先选择芯片分类')
    //     return false
    //   }
    // },
    // Tab标签被选中时触发

    // 处理图片预览
    handlePreview(file) {
      this.picPreviewPath = file.response.data.url;
      this.previewDialogVisible = true;
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // 1.获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2.从pics数组中，找到图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath);
      // 3.调用splice方法，移除图片信息
      this.addForm.splice(i, 1);
    },
    // 监听图片上传成功事件
    handleSuccess(response) {
      // 1.拼接得到一个图片信息对象 临时路径
      const picInfo = { pic: response.data.tmp_path };
      // 2.将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo);
    },
    // 添加芯片
    addChip() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error("请填写必要的表单项！");
        // 发送请求前：需对提交的表单进行处理total_cat attrs
        // this.addForm.total_cat = this.addForm.total_cat.join(',')
        // 以上写法不对：级联选择器绑定的对象total_cat要求是数组对象
        // 解决办法: 包：lodash 方法（深拷贝）：cloneDeep(boj)

        // 将this.addForm进行深拷贝
        const form = _.cloneDeep(this.addForm);
        form.total_cat = [form.total_cat, form.total_cat, form.total_cat].join(
          ","
        );

        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        // 发起请求添加芯片
        // 芯片名称必须是唯一的
        const { data: res } = await this.$http.post("chips", form);
        if (res.meta.status !== 201) {
          return this.$message.error("添加芯片失败！");
        }
        this.$message.success("添加芯片成功!");
        this.$router.push("/chip");
      });
    }
  }
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 8px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
