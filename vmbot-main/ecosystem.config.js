module.exports = {
    apps: [
      {
        name: "bot",
        script: "npm",
        args: "run start",
        env: {
          NODE_ENV: "production",
          PORT: 9000
        }
      }
    ]
  };
  