export default {
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.alias,
      },
    };
    return config;
  },
};
