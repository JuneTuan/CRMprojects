# API端点分析

## Admin-Web需要的API端点

### 认证
- POST /auth/login - 管理员登录
- GET /auth/profile - 获取管理员信息

### 客户管理
- GET /customers - 获取所有客户
- GET /customers/:id - 获取客户详情
- POST /customers - 创建客户
- PUT /customers/:id - 更新客户
- DELETE /customers/:id - 删除客户
- GET /customers/:id/points-history - 获取积分历史
- POST /customers/:id/add-points - 增加积分
- POST /customers/:id/use-points - 使用积分

### 优惠券管理
- GET /coupons - 获取所有优惠券
- GET /coupons/:id - 获取优惠券详情
- POST /coupons - 创建优惠券
- PUT /coupons/:id - 更新优惠券
- DELETE /coupons/:id - 删除优惠券

### 产品管理
- GET /products - 获取所有产品
- GET /products/:id - 获取产品详情
- POST /products - 创建产品
- PUT /products/:id - 更新产品
- DELETE /products/:id - 删除产品

### 活动管理
- GET /activities - 获取所有活动
- GET /activities/:id - 获取活动详情
- POST /activities - 创建活动
- PUT /activities/:id - 更新活动
- DELETE /activities/:id - 删除活动

### 订单管理
- GET /orders - 获取所有订单
- GET /orders/:id - 获取订单详情
- POST /orders - 创建订单
- PUT /orders/:id - 更新订单
- DELETE /orders/:id - 删除订单

### 奖品管理
- GET /prizes - 获取所有奖品
- GET /prizes/:id - 获取奖品详情
- POST /prizes - 创建奖品
- PUT /prizes/:id - 更新奖品
- DELETE /prizes/:id - 删除奖品

## H5需要的API端点

### 认证
- POST /auth/login - 客户登录
- POST /auth/register - 客户注册
- GET /auth/profile - 获取个人信息

### 订单
- GET /orders/customer/:customerId - 获取客户订单
- GET /orders/:id - 获取订单详情

### 优惠券
- GET /coupons/customer/:customerId - 获取客户优惠券
- POST /coupons/verify - 验证优惠券

### 积分
- GET /customers/:customerId - 获取客户信息
- GET /customers/:customerId/points-history - 获取积分历史

### 用户
- GET /auth/profile - 获取个人信息
- PUT /customers/:id - 更新个人信息

### 抽奖
- GET /activities - 获取活动列表
- GET /lottery/draw-info/:customerId/:activityId - 获取抽奖信息
- POST /lottery/draw - 抽奖
- GET /lottery/records/customer/:customerId - 获取抽奖记录
- PUT /lottery/records/:recordId/claim - 领取奖品

## 共享的API端点

### 认证
- POST /auth/login - 登录（admin和H5都使用）
- POST /auth/register - 注册（仅H5使用）
- GET /auth/profile - 获取个人信息（admin和H5都使用）

## 需要为H5创建的独立端点

建议使用 `/h5` 前缀来区分H5和admin的API：

### H5认证
- POST /h5/auth/login - H5客户登录
- POST /h5/auth/register - H5客户注册
- GET /h5/auth/profile - 获取H5客户信息

### H5订单
- GET /h5/orders - 获取当前客户的订单
- GET /h5/orders/:id - 获取订单详情

### H5优惠券
- GET /h5/coupons - 获取当前客户的优惠券
- POST /h5/coupons/verify - 验证优惠券

### H5积分
- GET /h5/customer/info - 获取客户信息
- GET /h5/customer/points-history - 获取积分历史

### H5用户
- GET /h5/customer/profile - 获取个人信息
- PUT /h5/customer/profile - 更新个人信息

### H5抽奖
- GET /h5/activities - 获取活动列表
- GET /h5/lottery/draw-info/:activityId - 获取抽奖信息
- POST /h5/lottery/draw - 抽奖
- GET /h5/lottery/records - 获取抽奖记录
- PUT /h5/lottery/records/:recordId/claim - 领取奖品