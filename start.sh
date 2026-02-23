#!/bin/bash

echo "======================================"
echo "  JunLite CRM 系统启动脚本"
echo "======================================"
echo ""

echo "1. 启动Docker服务 (MySQL + Server + Admin Web)..."
docker-compose up -d

echo ""
echo "2. 等待服务启动..."
sleep 15

echo ""
echo "3. 启动CustomerH5开发服务器..."
cd customerH5
npm run dev:h5 &
cd ..

echo ""
echo "======================================"
echo "  系统启动完成！"
echo "======================================"
echo ""
echo "访问地址："
echo "  - 管理后台: http://localhost:8080"
echo "  - CustomerH5: http://localhost:5173"
echo "  - 后端API: http://localhost:3001"
echo "  - MySQL: localhost:3306"
echo ""
echo "停止服务："
echo "  - Docker服务: docker-compose down"
echo "  - CustomerH5: pkill -f 'npm run dev:h5'"
echo ""