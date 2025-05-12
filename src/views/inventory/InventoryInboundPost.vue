<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { postInboundLog } from '@/api/logs'; // 修正引用的API
import { useUserStore } from '@/stores/user';
import type { InboundLogRequest } from '@/types/interfaces';

// 获取用户信息
const userStore = useUserStore();
const operatorId = userStore.getUserInfo()?.id || undefined;

// 表单数据（与接口请求类型匹配）
const formData = ref<InboundLogRequest>({
  operator_id: operatorId,
  model_number: '',
  manufacturer: '',
  specification: '',
  surface: undefined,
  category: undefined,
  warehouse_num: undefined,
  total_pieces: undefined,
  pieces_per_box: undefined,
  price_per_piece: undefined,
  remark: '',
});

// 表单加载状态
const loading = ref(false);

// 产品分类和表面处理选项（与数据库枚举一致）
const categoryOptions = [
  { label: '墙砖', value: 1 },
  { label: '地砖', value: 2 },
  { label: '胶', value: 3 },
  { label: '洁具', value: 4 }
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
    { required: false, message: '请输入规格', trigger: 'blur' },
    { pattern: /^[0-9]+x[0-9]+cm$/, message: '规格格式建议为数字x数字cm，如600x600cm', trigger: 'blur' }
  ],
  surface: [
    { required: false, message: '请选择表面处理', trigger: 'change' }
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

// 在 script setup 部分添加新的响应式变量和计算属性
const totalAmount = ref<number | undefined>(undefined);

// 监听总金额变化，自动计算单片价格
const calculatePricePerPiece = () => {
  if (totalAmount.value && formData.value.total_pieces) {
    formData.value.price_per_piece = Number((totalAmount.value / formData.value.total_pieces).toFixed(2));
  } else {
    formData.value.price_per_piece = undefined;
  }
};

// 监听总数量变化，如果总金额存在则重新计算单片价格
const handleTotalPiecesChange = () => {
  if (totalAmount.value) {
    calculatePricePerPiece();
  }
};

// 提交函数（匹配接口 /api/logs/inbound）
const submitInventory = async () => {
  if (!formRef.value) return;

  try {
    // 表单验证
    await (formRef.value as any).validate();

    loading.value = true;

    // 准备提交数据
    const submitData: InboundLogRequest = {
      operator_id: operatorId,
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
    surface: undefined,
    category: undefined,
    warehouse_num: undefined,
    total_pieces: undefined,
    pieces_per_box: undefined,
    price_per_piece: undefined,
    remark: '',
  };
  totalAmount.value = undefined;
};

// 计算总箱数
const totalBoxes = computed(() => {
  if (!formData.value.total_pieces || !formData.value.pieces_per_box || formData.value.pieces_per_box <= 0) {
    return '未知';
  }
  return Math.ceil(formData.value.total_pieces / formData.value.pieces_per_box);
});

// 计算属性：是否显示规格和表面处理字段
const showSpecificationAndSurface = computed(() => {
  return [1, 2].includes(formData.value.category || 0);
});

// 计算属性：是否显示每箱片数字段
const showPiecesPerBox = computed(() => {
  return [1, 2].includes(formData.value.category || 0);
});

// 计算属性：总数量的标签文本
const totalLabel = computed(() => {
  return [1, 2].includes(formData.value.category || 0) ? '总片数' : '总个数';
});

// 计算属性：单价的标签文本
const priceLabel = computed(() => {
  return [1, 2].includes(formData.value.category || 0) ? '单片价格' : '单个价格';
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
        <el-col :span="24">
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
      </el-row>

      <el-row :gutter="20" v-if="showSpecificationAndSurface">
        <el-col :span="12">
          <el-form-item label="规格" prop="specification">
            <el-input v-model="formData.specification" placeholder="请输入规格（如600x600cm）" />
            <div class="form-tip">格式：宽x高cm，例如：600x600cm</div>
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
        <el-col :span="12">
          <el-form-item label="仓库编码" prop="warehouse_num">
            <el-input v-model.number="formData.warehouse_num" placeholder="请输入仓库编码" type="number" min="1" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="showPiecesPerBox ? 8 : 12">
          <el-form-item :label="totalLabel" prop="total_pieces">
            <el-input 
                v-model.number="formData.total_pieces" 
                :placeholder="'请输入' + totalLabel" 
                type="number" 
                min="1"
                @input="handleTotalPiecesChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="showPiecesPerBox">
          <el-form-item label="每箱片数" prop="pieces_per_box">
            <el-input v-model.number="formData.pieces_per_box" placeholder="请输入每箱片数" type="number" min="1" />
          </el-form-item>
        </el-col>
        <el-col :span="showPiecesPerBox ? 8 : 12">
          <el-form-item label="总计金额">
            <el-input
                v-model.number="totalAmount"
                placeholder="请输入总计金额"
                type="number"
                step="0.01"
                min="0"
                @input="calculatePricePerPiece"
            >
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="showPiecesPerBox ? 8 : 12">
          <el-form-item :label="priceLabel" prop="price_per_piece">
            <el-input
                v-model.number="formData.price_per_piece"
                :placeholder="'自动计算' + priceLabel"
                type="number"
                step="0.01"
                min="0"
                disabled
            >
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
        </el-col>
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
              <span class="label">{{ totalLabel }}:</span>
              <span class="value">{{ formData.total_pieces || '未设置' }}</span>
            </div>
            <div class="summary-item" v-if="showPiecesPerBox">
              <span class="label">每箱片数:</span>
              <span class="value">{{ formData.pieces_per_box || '未设置' }}</span>
            </div>
            <div class="summary-item" v-if="showPiecesPerBox">
              <span class="label">总箱数:</span>
              <span class="value">{{ totalBoxes }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ priceLabel }}:</span>
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
  margin-bottom: 8px;
  display: inline-block;
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