module.exports = {
  apps: [
    {
      name: 'fogo-bot',
      script: 'fogo-bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/fogo-bot-error.log',
      out_file: './logs/fogo-bot-out.log',
      log_file: './logs/fogo-bot-combined.log',
      time: true,
      cron_restart: '0 0 * * *', // Restart daily at midnight
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'test-fogo-bot',
      script: 'test-fogo-bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/test-fogo-bot-error.log',
      out_file: './logs/test-fogo-bot-out.log',
      log_file: './logs/test-fogo-bot-combined.log',
      time: true,
      cron_restart: '0 0 * * *', // Restart daily at midnight
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
}; 