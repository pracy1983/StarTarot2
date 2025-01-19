/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Necessário para gerar arquivos estáticos
  images: {
    unoptimized: true, // Necessário para build estático
  },
  trailingSlash: true, // Recomendado para compatibilidade com Firebase Hosting
}

module.exports = nextConfig
