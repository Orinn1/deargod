/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      }
    ],
  },
  async rewrites() {
    return [
      { source: '/music.mp3', destination: '/audio/music.mp3' },
      { source: '/DEARGOD%20-%20ONLY%20DEARGOD.mp3', destination: '/audio/DEARGOD - ONLY DEARGOD.mp3' },
      { source: '/deargod-avatar.png', destination: '/images/deargod-avatar.png' },
      { source: '/deargod-bg.png', destination: '/images/deargod-bg.png' },
      { source: '/deargod-bg.jpg', destination: '/images/deargod-bg.jpg' },
      { source: '/deargod-metal-logo.png', destination: '/images/deargod-metal-logo.png' },
      { source: '/Spiky-DEARGOD-Metal-Logo-Photoroom.png', destination: '/images/Spiky-DEARGOD-Metal-Logo-Photoroom.png' },
      { source: '/bg.png', destination: '/images/bg.png' },
      { source: '/logo.png', destination: '/images/logo.png' },
      { source: '/1017.mp4', destination: '/videos/1017.mp4' },
      { source: '/og-image.jpg', destination: '/images/og-image.jpg' },
      { source: '/og-image.png', destination: '/images/og-image.png' },
    ];
  },
};

export default nextConfig;
