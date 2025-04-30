module.exports = {
  apps: [
    {
      name: "pdf-server",
      script: "server/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 4500,
        SERVER_URL: "http://104.36.85.100:4500"
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G"
    }
  ]
}; 