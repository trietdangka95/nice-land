#!/bin/bash

echo "🚀 Bắt đầu quá trình Deploy Nice-Land Backend..."

echo "📥 Đang kéo code mới nhất từ Git..."
git pull

echo "🛑 Đang tắt các container cũ..."
docker-compose down

echo "🏗️ Đang build lại Docker image (Bao gồm Prisma)..."
docker-compose build

echo "✅ Đang khởi động lại hệ thống..."
docker-compose up -d --remove-orphans

echo "🎉 Triển khai Backend hoàn tất! API đang chạy ngầm trong mạng proxy-tier."
