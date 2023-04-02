require("dotenv").config({ path: '.env '});

const API_KEY = process.env.API_KEY

module.exports = {
  env: {
    API_KEY
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = 'electron-renderer';
    }

    return config;
  },
};
