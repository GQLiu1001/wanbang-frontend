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
    id?: number; // 可选，因为新建时没有 id
    inventory_item_id: number;
    operation_type: number; // 1=入库, 2=出库, 3=调拨
    quantity_change: number;
    operator_id: number;
    source_warehouse?: number;
    target_warehouse?: number ;
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
    phone: string;
    avatar?: string;
    role_key?: string; // 查询时返回
    description?: string; // 查询时返回
}
//查询所有用户表单
export interface UserList {
    id?: number; // 可选，因为新建时没有 id
    username: string;
    phone: string;
    role_key?: string; // 查询时返回
    description?: string; // 查询时返回
}
// 分页查询参数
export interface PaginationParams {
    page?: number;
    size?: number;
}

// 库存查询参数
export interface InventoryQueryParams extends PaginationParams {
    category?: number;
    surface?: number;
}

// 日志查询参数
export interface LogQueryParams extends PaginationParams {
    start_time?: string;
    end_time?: string;
    operation_type?: number;
}

// 订单查询参数
export interface OrderQueryParams extends PaginationParams {
    start_time?: string;
    end_time?: string;
    customer_phone?: string;
}