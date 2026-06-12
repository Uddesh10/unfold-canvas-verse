// AWS Lambda: gallery-encoder
// Triggered by S3 ObjectCreated on gallery/{id}/original.{ext}
// Produces gallery/{id}/{thumb|grid|full}.webp with sharp.

import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3 = new S3Client({});

const VARIANTS = [
  { name: "thumb", width: 480, quality: 60 },
  { name: "grid", width: 1280, quality: 70 },
  { name: "full", width: 2400, quality: 78 },
];

const ORIGINAL_RE = /^(.+)\/original\.(jpe?g|png|webp)$/i;

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export const handler = async (event) => {
  const results = [];
  for (const record of event.Records ?? []) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    const match = key.match(ORIGINAL_RE);
    if (!match) {
      console.log("skip non-original key:", key);
      continue;
    }
    const prefix = match[1]; // gallery/{id}

    console.log("encoding", key);
    const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const input = await streamToBuffer(obj.Body);

    await Promise.all(
      VARIANTS.map(async (v) => {
        const buf = await sharp(input, { failOn: "none" })
          .rotate()
          .resize({ width: v.width, withoutEnlargement: true })
          .webp({ quality: v.quality })
          .toBuffer();
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: `${prefix}/${v.name}.webp`,
            Body: buf,
            ContentType: "image/webp",
            CacheControl: "public, max-age=31536000, immutable",
          })
        );
      })
    );
    results.push({ key, variants: VARIANTS.length });
  }
  return { ok: true, results };
};
