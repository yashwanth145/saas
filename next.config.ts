module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/resumereview',
        destination: '/api/resumereview', // Marks the route as dynamic
      },
    ];
  },
  turbopack: {
    root: 'C:\\Users\\yashwanth reddy s\\Desktop\\saas', // Set the correct root directory
  },
};