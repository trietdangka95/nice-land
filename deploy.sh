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

echo "🔎 Trạng thái container:"
docker-compose ps

echo "🩺 Kiểm tra API health trong container..."
docker-compose exec -T api wget -qO- http://127.0.0.1:4000/health/live || {
  echo "❌ API chưa trả health check. Log gần nhất:"
  docker-compose logs --tail=80 api
  exit 1
}

echo "🎉 Triển khai Backend hoàn tất! API đang chạy ngầm trong mạng proxy-tier."
