<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>芯片管理</el-breadcrumb-item>
      <el-breadcrumb-item>芯片列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加芯片</el-button>
        </el-col>
      </el-row>
      <!-- 表格数据 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="芯片名称" prop="chip_name"></el-table-column>
        <el-table-column label="芯片参数" prop="chip_desc"></el-table-column>
        <el-table-column label="芯片数量" prop="chip_number"></el-table-column>
        <el-table-column label="芯片曲线颜色">
          <template slot-scope="scope">
            <div>
              <span> {{ scope.row.color_mumber.includes("1") ? "红" : "" }}</span>
              <span> {{ scope.row.color_mumber.includes("2") ? "绿" : "" }}</span>
              <span> {{ scope.row.color_mumber.includes("3") ? "黄" : "" }}</span>
              <span> {{ scope.row.color_mumber.includes("4") ? "橙" : "" }}</span>
              <span> {{ scope.row.color_mumber.includes("5") ? "蓝" : "" }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="芯片曲线虚实">
          <template slot-scope="scope">
            <div>
              {{
                {
                  1: "虚",
                  '0': "实",
                }[scope.row.line]
              }}
            </div>
          </template></el-table-column
        >
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">{{
            scope.row.add_time | dataFormat
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.chip_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>

    <el-dialog
      title="修改信息"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="handleClose"
    >
      <el-form
        :model="chipForm"
        :rules="chipFormRules"
        ref="chipFormRef"
        label-width="100px"
      >
      <el-form-item label="芯片名称" prop="chipName">
          <el-input v-model="chipForm.chipName"></el-input>
        </el-form-item>
         <el-form-item label="芯片参数" prop="chipDesc">
          <el-input v-model="chipForm.chipDesc"></el-input>
        </el-form-item>
        <el-form-item label="芯片数量" prop="chipNum">
          <el-input v-model="chipForm.chipNum"></el-input>
        </el-form-item>
        <el-form-item label="芯片颜色" prop="chipColor">
          <el-select v-model="chipForm.chipColor" multiple placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option
          ></el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import moment from 'moment'

export default {
  data() {
    return {
      // 曲线颜色选择
      options: [
        {
          value: 1,
          label: "红",
        },
        {
          value: 2,
          label: "绿",
        },
        {
          value: 3,
          label: "黄",
        },
        {
          value: 4,
          label: "橙",
        },
        {
          value: 5,
          label: "蓝",
        },
      ],
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      // 芯片列表
      goodsList: [],
      // 芯片总数
      total: 0,
      addressDialogVisible: false,
      chipForm: {
        chipDesc: '',
        chipName: '',
        chipNum: 0,
        chipColor: [],
      },
      curItem: "",
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    handleClose() {
      this.addressDialogVisible = false;
      this.$refs['chipFormRef'].resetFields()
    },
    async submitForm() {
      const { data: res } = await this.$http.put('goods/' + this.curItem.chip_id,
        { ...this.curItem,
          goods_cat: '1,1,1',
          chip_desc: this.chipForm.chipDesc,
          chip_number: this.chipForm.chipNum,
          chip_name: this.chipForm.chipName,
          color_mumber: this.chipForm.chipColor.join(','),
        })

      if (res.meta.status === 200) {
        this.addressDialogVisible = false
        this.getGoodsList()
        this.$message.success('修改成功')
      } else {
        this.$message.error('修改失败')
      }
      this.$refs['chipFormRef'].resetFields()
      console.log(res);
    },
    showEditDialog(item) {
      this.addressDialogVisible = true;
      this.curItem = item
      this.chipForm.chipName = item.chip_name
      this.chipForm.chipDesc = item.chip_desc
      this.chipForm.chipNum = item.chip_number
    },
    // 根据分页获取对应的芯片列表
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取芯片列表失败！");
      }
      this.goodsList = res.data.goods;
      //   console.log(this.goodsList)
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newSize) {
      this.queryInfo.pagenum = newSize;
      this.getGoodsList();
    },
    // 通过Id删除芯片
    async removeById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该芯片, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除！");
      }
      const { data: res } = await this.$http.delete("goods/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除芯片失败！");
      }
      this.$message.success("删除芯片成功！");
      this.getGoodsList();
    },
    goAddPage() {
      this.$router.push("/statics/add");
    },
  },
};
</script>

<style lang="less" scoped></style>
