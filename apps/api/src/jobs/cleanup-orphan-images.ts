import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
  type _Object,
} from "@aws-sdk/client-s3";
import { prisma } from "@datcuatoi/database";
import { loadConfig } from "../config.js";

const DEFAULT_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

export function findOrphanImageKeys(input: {
  objects: Array<{
    key?: string;
    lastModified?: Date;
  }>;
  referencedKeys: Set<string>;
  now: Date;
  gracePeriodMs: number;
}) {
  const cutoff = input.now.getTime() - input.gracePeriodMs;
  return input.objects.flatMap((object) => {
    const key = object.key;
    const lastModified = object.lastModified;
    if (
      !key?.startsWith("sites/") ||
      !lastModified ||
      lastModified.getTime() > cutoff ||
      input.referencedKeys.has(key)
    ) {
      return [];
    }
    return [key];
  });
}

async function listObjects(client: S3Client, bucket: string) {
  const objects: _Object[] = [];
  let continuationToken: string | undefined;
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: "sites/",
        ContinuationToken: continuationToken,
      }),
    );
    objects.push(...(page.Contents ?? []));
    continuationToken = page.NextContinuationToken;
  } while (continuationToken);
  return objects;
}

async function main() {
  const config = loadConfig();
  if (!config.AWS_REGION || !config.AWS_S3_BUCKET) {
    throw new Error("AWS_REGION and AWS_S3_BUCKET are required.");
  }

  const apply = process.argv.includes("--apply");
  const client = new S3Client({ region: config.AWS_REGION });
  const [objects, images] = await Promise.all([
    listObjects(client, config.AWS_S3_BUCKET),
    prisma.propertyImage.findMany({ select: { storageKey: true } }),
  ]);
  const orphanKeys = findOrphanImageKeys({
    objects: objects.map((object) => ({
      key: object.Key,
      lastModified: object.LastModified,
    })),
    referencedKeys: new Set(images.map((image) => image.storageKey)),
    now: new Date(),
    gracePeriodMs: DEFAULT_GRACE_PERIOD_MS,
  });

  console.info(
    JSON.stringify({
      mode: apply ? "apply" : "dry-run",
      scanned: objects.length,
      orphanCount: orphanKeys.length,
      orphanKeys,
    }),
  );

  if (apply) {
    for (let index = 0; index < orphanKeys.length; index += 1000) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: config.AWS_S3_BUCKET,
          Delete: {
            Objects: orphanKeys
              .slice(index, index + 1000)
              .map((Key) => ({ Key })),
            Quiet: true,
          },
        }),
      );
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
