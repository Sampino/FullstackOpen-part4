const listHelper = require('../utils/list_helper')
const listWithOneBlog = require('../utils/mockBlogs').listWithOneBlog
const blogs = require('../utils/mockBlogs').blogs

describe('total likes', () => {
  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })

  test('count upvotes on multiple blogs', () => {
    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(36)
  })
})