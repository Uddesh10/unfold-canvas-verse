# gallery-encoder Lambda

Generates `thumb.webp` (480w q60), `grid.webp` (1280w q70), `full.webp` (2400w q78)
from `gallery/{id}/original.{ext}` uploads in S3.

## Setup

### 1. Package

```bash
cd aws/lambda
npm init -y
npm i @aws-sdk/client-s3 sharp --platform=linux --arch=x64
zip -r ../gallery-encoder.zip index.mjs node_modules package.json
```

(Or use the AWS-published `sharp` Lambda layer to keep the zip small.)

### 2. Create the function

- Runtime: Node.js 20.x
- Handler: `index.handler`
- Memory: 1024 MB
- Timeout: 60 s
- Upload `gallery-encoder.zip`

### 3. IAM permissions for the Lambda role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET/gallery/*"
    }
  ]
}
```

### 4. S3 trigger

Add an S3 trigger on the bucket with **Event types = PUT** and **Prefix = `gallery/`**.

Add **separate** suffix-filtered triggers (S3 only allows one suffix per filter):
- Suffix `original.jpg`
- Suffix `original.jpeg`
- Suffix `original.png`
- Suffix `original.webp`

The suffix filter is critical — it prevents the function from re-triggering on its own
`thumb.webp` / `grid.webp` / `full.webp` outputs.

### 5. S3 bucket CORS

```json
[
  {
    "AllowedOrigins": ["https://*.lovable.app", "https://your-domain.com", "http://localhost:*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 6. CloudFront

Create a distribution with the bucket as origin via **Origin Access Control**.
Use cache policy `CachingOptimized`. Note the distribution domain
(e.g. `d123abc.cloudfront.net`) and paste into the Lovable secret
`CLOUDFRONT_DOMAIN` as a full URL: `https://d123abc.cloudfront.net`.
