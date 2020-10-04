const lodash = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const sumOfLikes = (initial, accumulator) => {
    return initial + accumulator.likes;
  };

  return blogs.reduce(sumOfLikes, 0);
};

const favouriteBlog = (blogs) => {
  const getMax = (start, end) => {
    return start.likes > end.likes ? start : end;
  };
  return blogs.reduce(getMax);
};

const mostBlogs = (blogs) => {
  // convert the array of objects into an array
  // containing the authors
  const authorArray = blogs.map((a) => a.author);
  /* stackoverflow.com/a/18878650/13722525 */
  const mostCommonAuthor = lodash
    .chain(authorArray)
    .countBy()
    .toPairs()
    .maxBy(lodash.last)
    .head()
    .value();

  const getCount = (start, end) => {
    return end === mostCommonAuthor ? start + 1 : start;
  };
  const authorCount = authorArray.reduce(getCount, 0);

  return {
    author: mostCommonAuthor,
    blogs: authorCount,
  };
};

const mostLikes = (blogs) => {
  const authorAndLikes = blogs.map((a) => {
    const author = a.author;

    const sumLikes = (start, end) => {
      return end.author === author ? start + end.likes : start;
    };
    const likes = blogs.reduce(sumLikes, 0);

    return {
      author,
      likes,
    };
  });

  const noDuplicateAuthor = lodash.uniqBy(authorAndLikes, "author");
  const likesArray = noDuplicateAuthor.map((a) => a.likes);
  const maxLikesCount = Math.max(...likesArray);
  const findMax = noDuplicateAuthor.find((a) => a.likes === maxLikesCount);

  return findMax;
};

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes,
};
