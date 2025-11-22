/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SSL verification for corporate networks with self-signed certs
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

// Disable SSL verification in development (corporate proxy/firewall)
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export default nextConfig;
