import type { NextConfig } from "next";

/**
 * Always use the default `.next` folder. Do **not** set `NEXT_DIST_DIR` in
 * Windows “Environment variables” — Next.js 16 joins that value to the project
 * path and breaks with `C:\...` (ENOENT under `gamestore\C:\...`).
 *
 * **OneDrive / EPERM:** stop dev, delete the `.next` folder, then (cmd as Admin,
 * in project root):
 *   mklink /J .next C:\Users\<You>\AppData\Local\gamestore-next-cache
 * Create the target folder first. Then `npm run dev` — no env vars needed.
 */
const nextConfig: NextConfig = {
  distDir: ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "assets-prd.ignimgs.com",
      },
      /** Other IGN image CDN subdomains (e.g. media.*) */
      {
        protocol: "https",
        hostname: "*.ignimgs.com",
      },
    ],
  },
};

export default nextConfig;
