// Configuração do PM2 para produção
module.exports = {
  apps: [{
    name: 'crypto-nft-api',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/access.log',
    log_file: './logs/combined.log',
    time: true
  }]
};

