/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@xyflow/react"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/learn", destination: "/?screen=learn" },
      { source: "/plan", destination: "/?screen=plan" },
      { source: "/diagnostic", destination: "/?screen=diagnostic" },
      { source: "/build", destination: "/?screen=learn&phase=building" },
      { source: "/test", destination: "/?screen=learn&phase=testing" },
      { source: "/python", destination: "/?screen=learn&python=true" },
    ];
  },
};

export default nextConfig;
