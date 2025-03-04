<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { postInboundLog } from '@/api/logs'; // 修正引用的API
import { useUserStore } from '@/stores/user';
import type { InboundLogRequest } from '@/types/interfaces.ts';

// 获取用户信息
const userStore = useUserStore();
const operatorId = userStore.getUserInfo()?.id || null;

// 表单数据（与接口请求类型匹配）
const formData = ref<InboundLogRequest>({
  operator_id: operatorId,
  model_number: '',
  manufacturer: '',
  specification: '',
  surface: null,
  category: null,
  warehouse_num: null,
  total_pieces: null,
  pieces_per_box: null,
  price_per_piece: null,
  remark: '',
});

// 表单加载状态
const loading = ref(false);

// 产品分类和表面处理选项（与数据库枚举一致）
const categoryOptions = [
  { label: '墙砖', value: 1 },
  { label: '地砖', value: 2 },
];
const surfaceOptions = [
  { label: '抛光', value: 1 },
  { label: '哑光', value: 2 },
  { label: '釉面', value: 3 },
  { label: '通体大理石', value: 4 },
  { label: '微晶石', value: 5 },
  { label: '岩板', value: 6 },
];

// 表单验证规则
const rules = reactive({
  model_number: [
    { required: true, message: '请输入产品型号', trigger: 'blur' },
    { max: 50, message: '产品型号不能超过50个字符', trigger: 'blur' }
  ],
  manufacturer: [
    { required: true, message: '请输入制造厂商', trigger: 'blur' },
    { max: 50, message: '制造厂商不能超过50个字符', trigger: 'blur' }
  ],
  specification: [
    { required: true, message: '请输入规格', trigger: 'blur' },
    { pattern: /^[0-9]+x[0-9]+mm$/, message: '规格格式必须为数字x数字mm，如600x600mm', trigger: 'blur' }
  ],
  surface: [
    { required: true, message: '请选择表面处理', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择产品分类', trigger: 'change' }
  ],
  warehouse_num: [
    { required: true, message: '请输入仓库编码', trigger: 'blur' },
    { type: 'number', message: '仓库编码必须为数字', trigger: 'blur' }
  ],
  total_pieces: [
    { required: true, message: '请输入总片数', trigger: 'blur' },
    { type: 'number', min: 1, message: '总片数必须大于0', trigger: 'blur' }
  ],
  pieces_per_box: [
    { required: true, message: '请输入每箱片数', trigger: 'blur' },
    { type: 'number', min: 1, message: '每箱片数必须大于0', trigger: 'blur' }
  ],
  price_per_piece: [
    { required: true, message: '请输入单片价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '单片价格不能小于0', trigger: 'blur' }
  ]
});

// 表单引用
const formRef = ref(null);

// 提交函数（匹配接口 /api/logs/inbound）
const submitInventory = async () => {
  if (!formRef.value) return;

  try {
    // 表单验证
    await (formRef.value as any).validate();

    loading.value = true;

    // 准备提交数据
    const submitData: InboundLogRequest = {
      operator_id: operatorId || formData.value.operator_id,
      model_number: formData.value.model_number,
      manufacturer: formData.value.manufacturer,
      specification: formData.value.specification,
      surface: formData.value.surface as number,
      category: formData.value.category as number,
      warehouse_num: Number(formData.value.warehouse_num),
      total_pieces: Number(formData.value.total_pieces),
      pieces_per_box: Number(formData.value.pieces_per_box),
      price_per_piece: Number(formData.value.price_per_piece),
      remark: formData.value.remark || '',
    };

    // API调用
    const response = await postInboundLog(submitData);

    if (response.data.code === 200 || response.data.code === 201) {
      ElMessage.success('入库记录提交成功');
      resetForm();
    } else {
      ElMessage.error(response.data.message || '提交失败，请检查数据后重试');
    }
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('提交失败，请检查表单数据或稍后重试');
  } finally {
    loading.value = false;
  }
};

// 重置表单函数
const resetForm = () => {
  if (formRef.value) {
    (formRef.value as any).resetFields();
  }

  formData.value = {
    operator_id: operatorId,
    model_number: '',
    manufacturer: '',
    specification: '',
    surface: null,
    category: null,
    warehouse_num: null,
    total_pieces: null,
    pieces_per_box: null,
    price_per_piece: null,
    remark: '',
  };
};

// 计算总箱数
const totalBoxes = computed(() => {
  if (!formData.value.total_pieces || !formData.value.pieces_per_box || formData.value.pieces_per_box <= 0) {
    return '未知';
  }
  return Math.ceil(formData.value.total_pieces / formData.value.pieces_per_box);
});
</script>

<template>
  <div class="inbound-form-container">
    <h1>提交入库</h1>
    <el-divider />

    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="inbound-form"
        status-icon
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产品型号" prop="model_number">
            <el-input v-model="formData.model_number" placeholder="请输入产品型号" maxlength="50" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="制造厂商" prop="manufacturer">
            <el-input v-model="formData.manufacturer" placeholder="请输入制造厂商" maxlength="50" show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="规格" prop="specification">
            <el-input v-model="formData.specification" placeholder="请输入规格（如600x600mm）" />
            <div class="form-tip">格式：宽x高mm，例如：600x600mm</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仓库编码" prop="warehouse_num">
            <el-input v-model.number="formData.warehouse_num" placeholder="请输入仓库编码" type="number" min="1" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产品分类" prop="category">
            <el-radio-group v-model="formData.category">
              <el-radio
                  v-for="item in categoryOptions"
                  :key="item.value"
                  :label="item.value"
                  class="radio-item"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="表面处理" prop="surface">
            <el-radio-group v-model="formData.surface">
              <el-radio
                  v-for="item in surfaceOptions"
                  :key="item.value"
                  :label="item.value"
                  class="radio-item"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="总片数" prop="total_pieces">
            <el-input v-model.number="formData.total_pieces" placeholder="请输入总片数" type="number" min="1" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="每箱片数" prop="pieces_per_box">
            <el-input v-model.number="formData.pieces_per_box" placeholder="请输入每箱片数" type="number" min="1" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="单片价格" prop="price_per_piece">
            <el-input
                v-model.number="formData.price_per_piece"
                placeholder="请输入单片价格"
                type="number"
                step="0.01"
                min="0"
            >
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label="备注" prop="remark">
            <el-input
                v-model="formData.remark"
                placeholder="请输入备注（可选）"
                type="textarea"
                rows="3"
                maxlength="500"
                show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <div class="summary-info">
            <div class="summary-title">入库信息摘要</div>
            <div class="summary-item">
              <span class="label">总片数:</span>
              <span class="value">{{ formData.total_pieces || '未设置' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">每箱片数:</span>
              <span class="value">{{ formData.pieces_per_box || '未设置' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">总箱数:</span>
              <span class="value">{{ totalBoxes }}</span>
            </div>
            <div class="summary-item">
              <span class="label">单价:</span>
              <span class="value">{{ formData.price_per_piece ? `¥${formData.price_per_piece.toFixed(2)}` : '未设置' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">总金额:</span>
              <span class="value">{{
                  (formData.total_pieces && formData.price_per_piece)
                      ? `¥${(formData.total_pieces * formData.price_per_piece).toFixed(2)}`
                      : '未知'
                }}</span>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="submitInventory">提交入库</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.inbound-form-container {
  padding: 0 20px 40px;
}

h1 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
}

.inbound-form {
  margin-top: 30px;
}

.radio-item {
  margin-right: 16px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 4px;
}

.summary-info {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  height: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.summary-title {
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
  font-size: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.summary-item .label {
  color: #606266;
}

.summary-item .value {
  color: #303133;
  font-weight: 500;
}
</style>