module.exports = {
    apps: [
      {
        name: "test",
        script: "npm",
        args: "run start",
        env: {
          NODE_ENV: "production",
          PORT: 3000
        }
      }
    ]
  };
  