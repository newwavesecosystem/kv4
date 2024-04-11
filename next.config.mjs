/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");


/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dev.konn3ct.ng',
        port: '',
        pathname: '/storage/profile-photos/**',
      },
      {
        protocol: 'https',
        hostname: 'dev.konn3ct.ng',
        port: '',
        pathname: '/myroombanner/**',
      },
      {
        protocol: 'https',
        hostname: 'konn3ct.com',
        port: '',
        pathname: '/storage/profile-photos/**',
      },
      {
        protocol: 'https',
        hostname: 'konn3ct.com',
        port: '',
        pathname: '/myroombanner/**',
      },
      {
        protocol: 'https',
        hostname: 'konn3ct.com',
        port: '',
        pathname: '/assets/**',
      },
    ],
  },
};

export default config;
