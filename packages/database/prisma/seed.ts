import {
  PostStatus,
  PrismaClient,
  PropertyType,
  SubscriptionStatus,
  UserRole,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;

async function main() {
  const now = new Date();
  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await hash(defaultPassword, 12);

  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { code: "STARTER" },
    update: {
      name: "Khởi đầu",
      maxPosts: 30,
      maxImagesPerPost: 10,
      price: 299000,
      durationDays: 30,
      isActive: true,
    },
    create: {
      code: "STARTER",
      name: "Khởi đầu",
      maxPosts: 30,
      maxImagesPerPost: 10,
      price: 299000,
      durationDays: 30,
    },
  });

  const professionalPlan = await prisma.subscriptionPlan.upsert({
    where: { code: "PROFESSIONAL" },
    update: {
      name: "Chuyên nghiệp",
      maxPosts: 150,
      maxImagesPerPost: 20,
      price: 599000,
      durationDays: 30,
      isActive: true,
    },
    create: {
      code: "PROFESSIONAL",
      name: "Chuyên nghiệp",
      maxPosts: 150,
      maxImagesPerPost: 20,
      price: 599000,
      durationDays: 30,
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { code: "BUSINESS" },
    update: {
      name: "Doanh nghiệp",
      maxPosts: 10000,
      maxImagesPerPost: 30,
      price: 1299000,
      durationDays: 30,
      isActive: true,
    },
    create: {
      code: "BUSINESS",
      name: "Doanh nghiệp",
      maxPosts: 10000,
      maxImagesPerPost: 30,
      price: 1299000,
      durationDays: 30,
    },
  });

  await prisma.user.upsert({
    where: {
      username_siteId: {
        username: "superadmin",
        siteId: null,
      },
    },
    update: {
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      username: "superadmin",
      email: "admin@datcuatoi.vn",
      passwordHash,
      fullName: "Quản trị Đất Của Tôi",
      role: UserRole.SUPER_ADMIN,
    },
  });

  const minhPhat = await prisma.site.upsert({
    where: { slug: "minhphat" },
    update: {
      name: "Nhà Đất Minh Phát",
      planId: professionalPlan.id,
      isActive: true,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    },
    create: {
      name: "Nhà Đất Minh Phát",
      slug: "minhphat",
      tagline: "Chọn đúng nơi, dựng đúng tổ ấm",
      themeColor: "#315c45",
      phone: "0903868979",
      email: "hello@minhphat.vn",
      address: "28 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
      facebookUrl: "https://facebook.com",
      zaloPhone: "0903868979",
      planId: professionalPlan.id,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionStart: now,
      subscriptionEnd: new Date(now.getTime() + 365 * DAY),
    },
  });

  const anLand = await prisma.site.upsert({
    where: { slug: "anland" },
    update: {
      name: "An Land",
      planId: starterPlan.id,
      isActive: true,
    },
    create: {
      name: "An Land",
      slug: "anland",
      tagline: "Không gian sống bình yên giữa lòng thành phố",
      themeColor: "#8b5a3c",
      phone: "0912333558",
      email: "contact@anland.vn",
      address: "Thủ Đức, TP. Hồ Chí Minh",
      planId: starterPlan.id,
      subscriptionStatus: SubscriptionStatus.TRIAL,
      subscriptionStart: now,
      subscriptionEnd: new Date(now.getTime() + 30 * DAY),
    },
  });

  for (const site of [minhPhat, anLand]) {
    await prisma.siteDomain.upsert({
      where: { hostname: `${site.slug}.datcuatoi.vn` },
      update: {
        siteId: site.id,
        status: "VERIFIED",
        isPrimary: true,
        isPlatform: true,
        verifiedAt: now,
      },
      create: {
        siteId: site.id,
        hostname: `${site.slug}.datcuatoi.vn`,
        status: "VERIFIED",
        isPrimary: true,
        isPlatform: true,
        verifiedAt: now,
      },
    });
  }

  const minhPhatAdmin = await prisma.user.upsert({
    where: {
      username_siteId: {
        username: "admin",
        siteId: minhPhat.id,
      },
    },
    update: {
      passwordHash,
      isActive: true,
    },
    create: {
      siteId: minhPhat.id,
      username: "admin",
      email: "admin@minhphat.vn",
      passwordHash,
      fullName: "Nguyễn Minh Phát",
      phone: "0903868979",
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: {
      username_siteId: {
        username: "admin",
        siteId: anLand.id,
      },
    },
    update: {
      passwordHash,
      isActive: true,
    },
    create: {
      siteId: anLand.id,
      username: "admin",
      email: "admin@anland.vn",
      passwordHash,
      fullName: "Quản trị An Land",
      role: UserRole.ADMIN,
    },
  });

  const houseCategory = await prisma.propertyCategory.upsert({
    where: {
      siteId_slug: {
        siteId: minhPhat.id,
        slug: "nha-o",
      },
    },
    update: { name: "Nhà ở", deletedAt: null },
    create: {
      siteId: minhPhat.id,
      name: "Nhà ở",
      slug: "nha-o",
    },
  });

  const apartmentCategory = await prisma.propertyCategory.upsert({
    where: {
      siteId_slug: {
        siteId: minhPhat.id,
        slug: "can-ho",
      },
    },
    update: { name: "Căn hộ", deletedAt: null },
    create: {
      siteId: minhPhat.id,
      name: "Căn hộ",
      slug: "can-ho",
    },
  });

  const villa = await prisma.propertyPost.upsert({
    where: {
      siteId_slug: {
        siteId: minhPhat.id,
        slug: "biet-thu-nhiet-doi-son-tra",
      },
    },
    update: {
      status: PostStatus.PUBLISHED,
      deletedAt: null,
    },
    create: {
      siteId: minhPhat.id,
      categoryId: houseCategory.id,
      slug: "biet-thu-nhiet-doi-son-tra",
      title: "Biệt thự nhiệt đới nhìn ra bán đảo Sơn Trà",
      description:
        "Căn biệt thự ba tầng được thiết kế theo tinh thần nghỉ dưỡng, ôm trọn ánh sáng tự nhiên và khoảng xanh.",
      type: PropertyType.HOUSE,
      price: 18500000000,
      area: 285,
      address: "Đường Hoàng Sa, Thọ Quang",
      province: "Đà Nẵng",
      district: "Sơn Trà",
      ward: "Thọ Quang",
      status: PostStatus.PUBLISHED,
      publishedAt: now,
      createdById: minhPhatAdmin.id,
      updatedById: minhPhatAdmin.id,
    },
  });

  await prisma.propertyImage.upsert({
    where: { storageKey: `sites/${minhPhat.id}/demo/villa-son-tra.jpg` },
    update: { postId: villa.id, sortOrder: 0 },
    create: {
      postId: villa.id,
      storageKey: `sites/${minhPhat.id}/demo/villa-son-tra.jpg`,
      url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
      mimeType: "image/jpeg",
      sortOrder: 0,
    },
  });

  await prisma.propertyPost.upsert({
    where: {
      siteId_slug: {
        siteId: minhPhat.id,
        slug: "can-ho-huong-bien-my-khe",
      },
    },
    update: { status: PostStatus.PUBLISHED, deletedAt: null },
    create: {
      siteId: minhPhat.id,
      categoryId: apartmentCategory.id,
      slug: "can-ho-huong-bien-my-khe",
      title: "Căn hộ hai phòng ngủ, ban công hướng biển Mỹ Khê",
      description: "Căn hộ nội thất sáng màu, ban công rộng và tầm nhìn thoáng.",
      type: PropertyType.APARTMENT,
      price: 4250000000,
      area: 78,
      province: "Đà Nẵng",
      district: "Ngũ Hành Sơn",
      ward: "Mỹ An",
      status: PostStatus.PUBLISHED,
      publishedAt: now,
      createdById: minhPhatAdmin.id,
      updatedById: minhPhatAdmin.id,
    },
  });

  console.info("Seed completed.");
  console.info(`Demo password: ${defaultPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
