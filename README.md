This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## App link association files

The iOS and Android association files live in `public/.well-known/` and are
served at `/.well-known/apple-app-site-association` (no `.json` extension) and
`/.well-known/assetlinks.json`. `vercel.json` sets their JSON content type.

Before deploying, replace `REPLACE_WITH_PLAY_APP_SIGNING_SHA256` in
`assetlinks.json` with the Play app signing certificate's SHA-256 fingerprint
from Play Console → App integrity. The supplied debug fingerprint is retained.

Attach all four domains below to the Vercel project and remove dashboard domain
redirects so these endpoints can return files directly. Any website redirects
must exclude `/.well-known/`.

After deployment, verify both endpoints on every domain without following redirects:

```bash
for domain in hashforgamers.com www.hashforgamers.com hashforgamers.co.in www.hashforgamers.co.in; do
  for file in apple-app-site-association assetlinks.json; do
    curl -sS -o /dev/null -w "$domain/$file: %{http_code} %{content_type}\n" "https://$domain/.well-known/$file"
  done
done
```

Every result should show `200` and `application/json`.
