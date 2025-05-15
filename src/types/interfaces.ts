// 派送订单查询参数
export interface DeliveryQueryParams extends PaginationParams {
    orderNo?: string;
    customerPhone?: string;
    status?: number;
    driverId?: number;
  }
  
  // 派送订单数据
  export interface DeliveryOrder {
    id?: number;
    orderNo: string;
    driverId?: number;
    driverName?: string;
    driverPhone?: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryStatus: number; // 1=待派送,2=待接单,3=配送中,4=已完成,5=已取消
    deliveryFee: number;
    deliveryNote?: string;
    goodsWeight: number;
    createTime?: string;
    updateTime?: string;
  }
  
  // 派送请求参数
  export interface DispatchRequest {
    orderId: number;
    orderNo: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryNote?: string;
    goodsWeight: number;
    deliveryFee: number;
  }

// 用户登录请求参数
export interface LoginRequest {
    username: string;
    password: string;
}

// 用户注册请求参数
export interface RegisterRequest {
    username: string;
    password: string;
    phone: string;
}

// 重置密码请求参数
export interface ResetPasswordRequest {
    username: string;
    phone: string;
    newPassword: string;
}
// interfaces.ts 中的售后相关类型定义

// 售后查询参数
export interface AftersaleQueryParams {
    page?: number;
    size?: number;
    order_id?: number;
    aftersale_type?: number;
    aftersale_status?: number;
    start_time?: string;
    end_time?: string;
}
// 修改密码请求参数
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}
// 库存项模型
export interface InventoryItem {
    id?: number; // 可选，因为新建时没有 id
    model_number: string;
    manufacturer: string;
    specification: string;
    surface: number; // 1=抛光, 2=哑光, 3=釉面, 4=通体大理石, 5=微晶石, 6=岩板
    category: number ; // 1=墙砖, 2=地砖
    warehouse_num: number ;
    total_pieces: number;
    price_per_piece: number;
    pieces_per_box: number;
    remark?: string;
    create_time?: string;
    update_time?: string;
}

// 库存操作日志模型
export interface InventoryLog {
    id?: number;
    inventory_item_id: number;
    operation_type: number; // 1=入库 2=出库 3=调拨 4=冲正
    quantity_change: number;
    operator_id: number;
    source_warehouse: number | null;
    target_warehouse: number | null;
    remark?: string;
    create_time?: string;
    update_time?: string;
}

// 订单模型
export interface Order {
    order_no?: string; // 新建时可选，后端生成
    item_id: number;
    model_number?: string; // 可选，查询时返回
    quantity: number;
    adjusted_quantity?: number; // 可选，售后调整后
    total_amount: number;
    adjusted_amount?: number; // 可选，售后调整后
    customer_phone: string;
    operator_id: number;
    order_remark?: string;
    aftersale_type?: number; // 1=买多退货退款, 2=买少补货补款
    aftersale_status?: number; // 1=新建, 2=已解决
    order_create_time?: string;
    order_update_time?: string;
}

// 售后模型
export interface Aftersale {
    order_no: string;
    aftersale_type: number; // 1=买多退货退款, 2=买少补货补款
    aftersale_status: number; // 1=新建, 2=已解决
    quantity_change: number;
    amount_change: number;
    resolution_result?: string;
    aftersale_operator: number;
}

// 用户模型
export interface User {
    id?: number; // 可选，因为新建时没有 id
    username: string;
    password?: string; // 可选，查询时可能不返回
    phone?: string; // 改为可选
    avatar?: string;
    role_id?: string; // 查询时返回
    role_key?: string; // 角色键名
    description?: string; // 查询时返回
}
//查询所有用户表单
export interface UserList {
    id?: number; // 可选，因为新建时没有 id
    username: string;
    role_id?: string; // 查询时返回
    role_key?: string; // 角色键名
    description?: string; // 查询时返回
}
// 分页查询参数
export interface PaginationParams {
    page?: number;
    size?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

// 库存查询参数
export interface InventoryQueryParams extends PaginationParams {
    category?: number;
    surface?: number;
}


// 查询参数
export interface LogQueryParams {
    page?: number;
    size?: number;
    operation_type: number; // 1=入库 2=出库 3=调拨 4=冲正
    start_time?: string;
    end_time?: string;
}

// 订单查询参数
export interface OrderQueryParams extends PaginationParams {
    start_time?: string;
    end_time?: string;
    customer_phone?: string;
}

// 订单项模型（新增）
export interface OrderItem {
    id?: number;
    order_id?: number;
    item_id: number;
    model_number?: string;
    specification?: string;
    manufacturer?: string;
    quantity: number;
    price_per_piece: number;
    subtotal: number;
    adjusted_quantity?: number | null;
}

// 完整订单模型（新增）
export interface FullOrder {
    id?: number;
    order_no?: string;
    customer_phone: string;
    operator_id: number;
    operator_name?: string;
    total_amount: number;
    adjusted_amount?: number;
    order_remark?: string;
    order_create_time?: string;
    order_update_time?: string;
    aftersale_status?: number;
    aftersale_type?: number;
    items?: OrderItem[];
    items_count?: number;
}

// 售后项目模型（新增）
export interface AftersaleItem {
    order_item_id: number;
    quantity_change: number;
    amount_change: number;
}

// 完整售后模型（新增）
export interface FullAftersale {
    id?: number;
    order_no: string;
    order_id?: number;
    aftersale_type: number; // 1=买多退货退款, 2=买少补货补款
    aftersale_status: number; // 1=新建, 2=已解决
    items: AftersaleItem[];
    resolution_result?: string;
    aftersale_operator: number;
    create_time?: string;
}

// 售后查询参数（新增）
export interface AftersaleQueryParams extends PaginationParams {
    order_no?: string;
    aftersale_type?: number;
    aftersale_status?: number;
    start_time?: string;
    end_time?: string;
}
// interfaces.ts

// 登录请求参数
export interface LoginRequest {
    username: string;
    password: string;
}

// 注册请求参数
export interface RegisterRequest {
    username: string;
    password: string;
    phone: string;
}

// 重置密码请求参数
export interface ResetPasswordRequest {
    username: string;
    phone: string;
    newPassword: string;
}

// 用户信息修改请求
export interface UpdateUserRequest {
    avatar?: string;
    username?: string;
    phone?: string;
    oldPassword?: string;
    password?: string;
}

// 分页查询参数
export interface PaginationParams {
    page?: number;
    size?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

// 库存查询参数
export interface InventoryQueryParams extends PaginationParams {
    category?: number;
    surface?: number;
}

// 库存物品信息
export interface InventoryItem {
    id?: number;
    model_number: string;
    manufacturer: string;
    specification: string;
    surface: number;
    category: number;
    warehouse_num: number;
    total_pieces: number;
    price_per_piece: number;
    pieces_per_box: number;
    remark?: string;
    create_time?: string;
    update_time?: string;
}

// 库存日志查询参数
export interface LogQueryParams extends PaginationParams {
    operation_type: number;
    start_time?: string;
    end_time?: string;
}

// 入库请求参数
export interface InboundLogRequest {
    operator_id?: number;
    model_number?: string;
    manufacturer?: string;
    specification?: string;
    warehouse_num?: number;
    category?: number;
    surface?: number;
    total_pieces?: number;
    pieces_per_box?: number;
    price_per_piece?: number;
    remark?: string;
}

// 调库请求参数
export interface TransferLogRequest {
    inventory_item_id?: number;
    operator_id?: number;
    source_warehouse?: number;
    target_warehouse?: number;
    remark?: string;
}

// 库存日志修改请求
export interface InventoryLogChangeRequest {
    id: number;
    inventory_item_id: number;
    operator_id: number;
    operation_type: number;
    source_warehouse?: number | null;
    target_warehouse?: number | null;
    quantity_change: number;
    remark?: string;
}

// 订单查询参数
export interface OrderQueryParams extends PaginationParams {
    start_time?: string;
    end_time?: string;
    customer_phone?: string;
}

// 订单创建请求
export interface OrderPostRequest {
    customer_phone: string;
    operator_id: number;
    order_remark?: string;
    total_amount: number;
    items: Array<{
        model_number: string;
        item_id: number;
        quantity: number;
        price_per_piece: number;
        subtotal: number;
        source_warehouse: number;
    }>;
}

// 订单修改请求
export interface OrderChangeRequest {
    customer_phone?: string;
    operator_id?: number;
    order_remark?: string;
    dispatch_status?: number; // 派送状态
    delivery_address?: string; // 配送地址
}

// 订单项修改请求
export interface OrderItemChangeRequest {
    quantity: number;
    price_per_piece: number;
    subtotal: number;
}

// 售后创建请求
export interface AftersalePostRequest {
    order_id: number;
    aftersale_type: number;
    aftersale_status: number;
    items: Array<{
        order_item_id: number;
        quantity_change: number;
        amount_change: number;
    }>;
    resolution_result?: string;
    aftersale_operator: number;
}

// 司机查询参数
export interface DriverQueryParams extends PaginationParams {
  name?: string;
  phone?: string;
  auditStatus?: number; // 0=未审核,1=已通过,2=已拒绝
  workStatus?: number; // 1=空闲,2=忙碌,3=离线
}

// 司机信息
export interface Driver {
  id: number;
  name: string;
  phone: string;
  avatar?: string;
  auditStatus: number; // 0=未审核,1=已通过,2=已拒绝
  workStatus: number; // 1=空闲,2=忙碌,3=离线
  money: number; // 司机账户余额
  openid?: string;
  createTime?: string;
  updateTime?: string;
}

// 司机审核请求参数
export interface DriverApprovalRequest {
  auditStatus: number; // 1=已通过,2=已拒绝
  auditRemark?: string;
  auditor: string;
}