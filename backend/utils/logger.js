const info = (...args) => {
  if (process.env !== "test") {
    console.log(...args);
  }
};

const error = (...args) => {
  if (process.env !== "test") {
    console.error(...args);
  }
};

module.exports = {
  info,
  error,
};
