var _ = require('lodash');

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((ac, tot) => ac + tot.likes, 0);
};

const mostBlogs = (blogs) => {
  const authors = blogs.map((blog) => blog.author);
  const topAuthor = _.head(_(authors).countBy().entries().maxBy(_.last));
  const authorBlogs = blogs.filter((x) => x.author === topAuthor);

  return { author: topAuthor, blogs: authorBlogs.length };
};

const mostLikes = (blogs) => {
  const topLikes = _.maxBy(blogs, (blog) => blog.likes);
  const topAuthor = blogs.filter((x) => x.author === topLikes.author);
  const totalLikes = topAuthor.reduce((acc, tot) => acc + tot.likes, 0);

  return { author: topLikes.author, likes: totalLikes };
};

module.exports = {
  dummy,
  totalLikes,
  mostBlogs,
  mostLikes,
};
