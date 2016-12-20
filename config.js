module.exports = {
  port: process.env.PORT || 8080,
  mongoose: {
    url: "mongodb://localhost/blog"
  }
};
