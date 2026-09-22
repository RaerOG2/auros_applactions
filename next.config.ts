import type {
  NextConfig,
} from "next";


const isDevelopment =
  process.env.NODE_ENV ===
  "development";


const contentSecurityPolicy = `
  default-src 'self';

  base-uri 'self';

  form-action 'self';

  frame-ancestors 'none';

  object-src 'none';

  script-src
    'self'
    'unsafe-inline'
    ${isDevelopment ? "'unsafe-eval'" : ""};

  style-src
    'self'
    'unsafe-inline';

  style-src-elem
    'self'
    'unsafe-inline';

  style-src-attr
    'unsafe-inline';

  img-src
    'self'
    data:
    blob:
    https:;

  font-src
    'self'
    data:
    https:;

  connect-src
    'self'
    https:
    wss:
    ${isDevelopment ? "http: ws:" : ""};

  media-src
    'self'
    data:
    blob:
    https:;

  worker-src
    'self'
    blob:;

  child-src
    'self'
    blob:;

  manifest-src
    'self';

  frame-src
    'self'
    https:;

  ${isDevelopment ? "" : "upgrade-insecure-requests;"}
`
  .replace(
    /\s{2,}/g,
    " "
  )
  .trim();


const securityHeaders = [
  {
    key:
      "Content-Security-Policy",

    value:
      contentSecurityPolicy,
  },

  {
    key:
      "X-Frame-Options",

    value:
      "DENY",
  },

  {
    key:
      "X-Content-Type-Options",

    value:
      "nosniff",
  },

  {
    key:
      "Referrer-Policy",

    value:
      "strict-origin-when-cross-origin",
  },

  {
    key:
      "Permissions-Policy",

    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "serial=()",
      "bluetooth=()",
      "accelerometer=()",
      "gyroscope=()",
      "magnetometer=()",
    ].join(
      ", "
    ),
  },

  {
    key:
      "Strict-Transport-Security",

    value:
      "max-age=31536000; includeSubDomains",
  },

  {
    key:
      "X-DNS-Prefetch-Control",

    value:
      "off",
  },

  {
    key:
      "X-Permitted-Cross-Domain-Policies",

    value:
      "none",
  },
];


const nextConfig:
  NextConfig = {
  poweredByHeader:
    false,


  async headers() {
    return [
      {
        source:
          "/:path*",

        headers:
          securityHeaders,
      },
    ];
  },
};


export default nextConfig;