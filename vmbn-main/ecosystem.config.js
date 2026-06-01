module.exports = {
    apps: [
      {
        name: "bn",
        script: "npm",
        args: "run start",
        env: {
          NODE_ENV: "production",
          PORT: 8000
        }
      }
    ]
  };
  