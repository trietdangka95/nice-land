import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const rootDomain = process.env.ROOT_DOMAIN ?? "nice-land.id.vn";

async function main() {
  const sites = await prisma.site.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      slug: true,
      domains: {
        where: { isPlatform: true },
        select: { id: true, hostname: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  for (const site of sites) {
    const hostname = `${site.slug}.${rootDomain}`;
    const existing = site.domains[0];

    if (existing) {
      await prisma.siteDomain.update({
        where: { id: existing.id },
        data: {
          hostname,
          isPrimary: true,
          isPlatform: true,
          status: "VERIFIED",
          verifiedAt: new Date(),
        },
      });
    } else {
      await prisma.siteDomain.create({
        data: {
          siteId: site.id,
          hostname,
          isPrimary: true,
          isPlatform: true,
          status: "VERIFIED",
          verifiedAt: new Date(),
        },
      });
    }

    await prisma.siteDomain.deleteMany({
      where: {
        siteId: site.id,
        isPlatform: true,
        hostname: { not: hostname },
      },
    });

    console.info(`Synced ${site.slug}: ${hostname}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
