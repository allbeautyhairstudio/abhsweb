module.exports = {
  apps: [
    {
      name: 'abhs',
      cwd: '/var/www/abhsweb/abhs',
      script: 'node_modules/.bin/next',
      args: 'start -p 3005',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
        HOSTNAME: '0.0.0.0',
      },
      restart_delay: 5000,
      max_restarts: 10,
      autorestart: true,
    },
  ],
};
