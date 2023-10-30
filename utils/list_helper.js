const dummy = blogs => {
  if (blogs) {
    return 1
  }
}

const totalLikes = blogs => {
  return blogs.reduce((total, blog) => total + parseInt(blog.upvotes), 0)
}

const favouriteBlog = blogs => {
  return blogs.reduce((bestBlog, currentBlog) => {
    return currentBlog.upvotes > bestBlog.upvotes ? currentBlog : bestBlog
  }, blogs[0])
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog
}