#!/bin/bash

# CRM系统 R1.0.0 部署脚本
# 使用方法: ./deploy.sh [environment]
# environment: development | production

set -e

ENVIRONMENT=${1:-production}
PROJECT_DIR="/Users/duanjunyi/LocalFY25/codeGPT/CRMprojects"

echo "=========================================="
echo "CRM系统部署脚本 - R1.0.0"
echo "=========================================="
echo "环境: $ENVIRONMENT"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Node.js版本
check_node_version() {
    echo -n "检查Node.js版本... "
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        echo -e "${GREEN}✓ $NODE_VERSION${NC}"
    else
        echo -e "${RED}✗ $NODE_VERSION (需要 >= $REQUIRED_VERSION)${NC}"
        exit 1
    fi
}

# 检查npm版本
check_npm_version() {
    echo -n "检查npm版本... "
    NPM_VERSION=$(npm -v)
    REQUIRED_VERSION="9.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NPM_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        echo -e "${GREEN}✓ $NPM_VERSION${NC}"
    else
        echo -e "${RED}✗ $NPM_VERSION (需要 >= $REQUIRED_VERSION)${NC}"
        exit 1
    fi
}

# 检查Git状态
check_git_status() {
    echo -n "检查Git状态... "
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠ 有未提交的更改${NC}"
        git status --short
        read -p "是否继续部署? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo -e "${GREEN}✓ 工作目录干净${NC}"
    fi
}

# 验证当前分支
verify_branch() {
    echo -n "验证当前分支... "
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" = "V5.0" ]; then
        echo -e "${GREEN}✓ $CURRENT_BRANCH${NC}"
    else
        echo -e "${YELLOW}⚠ 当前分支: $CURRENT_BRANCH (建议使用 V5.0)${NC}"
        read -p "是否继续部署? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 构建后端
build_backend() {
    echo ""
    echo "=========================================="
    echo "构建后端服务"
    echo "=========================================="
    
    cd "$PROJECT_DIR/server"
    
    echo "安装依赖..."
    npm ci --production
    
    echo "构建项目..."
    npm run build
    
    if [ -d "dist" ]; then
        echo -e "${GREEN}✓ 后端构建成功${NC}"
    else
        echo -e "${RED}✗ 后端构建失败${NC}"
        exit 1
    fi
}

# 构建管理后台
build_admin() {
    echo ""
    echo "=========================================="
    echo "构建管理后台"
    echo "=========================================="
    
    cd "$PROJECT_DIR/admin-web"
    
    echo "安装依赖..."
    npm ci
    
    echo "构建项目..."
    npm run build
    
    if [ -d "dist" ]; then
        echo -e "${GREEN}✓ 管理后台构建成功${NC}"
    else
        echo -e "${RED}✗ 管理后台构建失败${NC}"
        exit 1
    fi
}

# 构建H5前端
build_h5() {
    echo ""
    echo "=========================================="
    echo "构建H5前端"
    echo "=========================================="
    
    cd "$PROJECT_DIR/customerH5"
    
    echo "安装依赖..."
    npm ci
    
    echo "构建H5项目..."
    npm run build:h5
    
    if [ -d "dist/build/h5" ]; then
        echo -e "${GREEN}✓ H5前端构建成功${NC}"
    else
        echo -e "${RED}✗ H5前端构建失败${NC}"
        exit 1
    fi
}

# 创建部署包
create_deployment_package() {
    echo ""
    echo "=========================================="
    echo "创建部署包"
    echo "=========================================="
    
    cd "$PROJECT_DIR"
    
    # 创建部署目录
    DEPLOY_DIR="deployment-r1.0.0"
    rm -rf "$DEPLOY_DIR"
    mkdir -p "$DEPLOY_DIR"
    
    # 复制后端
    echo "复制后端文件..."
    mkdir -p "$DEPLOY_DIR/server"
    cp -r server/dist "$DEPLOY_DIR/server/"
    cp server/package.json "$DEPLOY_DIR/server/"
    cp server/.env.production "$DEPLOY_DIR/server/.env"
    
    # 复制管理后台
    echo "复制管理后台文件..."
    mkdir -p "$DEPLOY_DIR/admin-web"
    cp -r admin-web/dist "$DEPLOY_DIR/admin-web/"
    cp admin-web/.env.production "$DEPLOY_DIR/admin-web/.env"
    
    # 复制H5前端
    echo "复制H5前端文件..."
    mkdir -p "$DEPLOY_DIR/customerH5"
    cp -r customerH5/dist/build/h5/* "$DEPLOY_DIR/customerH5/"
    cp customerH5/.env.production "$DEPLOY_DIR/customerH5/.env"
    
    # 复制部署文档
    echo "复制部署文档..."
    cp DEPLOYMENT.md "$DEPLOY_DIR/"
    cp README.md "$DEPLOY_DIR/"
    
    # 创建部署脚本
    echo "创建部署脚本..."
    cat > "$DEPLOY_DIR/deploy.sh" << 'EOF'
#!/bin/bash
# 生产环境部署脚本
set -e

echo "开始部署CRM系统 R1.0.0..."

# 部署后端
echo "部署后端服务..."
cd server
pm2 stop crm-server || true
pm2 start dist/src/main.js --name crm-server

# 部署管理后台
echo "部署管理后台..."
cd ../admin-web
sudo cp -r dist/* /var/www/crm-admin/
sudo systemctl reload nginx

# 部署H5前端
echo "部署H5前端..."
cd ../customerH5
sudo cp -r * /var/www/crm-h5/
sudo systemctl reload nginx

echo "部署完成！"
echo "管理后台: http://admin.your-domain.com"
echo "H5前端: http://h5.your-domain.com"
EOF
    chmod +x "$DEPLOY_DIR/deploy.sh"
    
    # 创建压缩包
    echo "创建压缩包..."
    tar -czf "crm-r1.0.0-deployment.tar.gz" "$DEPLOY_DIR"
    
    echo -e "${GREEN}✓ 部署包创建成功: crm-r1.0.0-deployment.tar.gz${NC}"
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "=========================================="
    echo "部署信息"
    echo "=========================================="
    echo "版本: R1.0.0"
    echo "环境: $ENVIRONMENT"
    echo "部署包: crm-r1.0.0-deployment.tar.gz"
    echo ""
    echo "下一步操作:"
    echo "1. 将 crm-r1.0.0-deployment.tar.gz 上传到服务器"
    echo "2. 解压: tar -xzf crm-r1.0.0-deployment.tar.gz"
    echo "3. 修改配置文件中的数据库连接信息"
    echo "4. 运行 ./deploy.sh 进行部署"
    echo ""
    echo "详细部署说明请参考: DEPLOYMENT.md"
}

# 主流程
main() {
    check_node_version
    check_npm_version
    check_git_status
    verify_branch
    
    if [ "$ENVIRONMENT" = "production" ]; then
        build_backend
        build_admin
        build_h5
        create_deployment_package
        show_deployment_info
    else
        echo -e "${YELLOW}开发环境部署，跳过构建步骤${NC}"
    fi
}

main
