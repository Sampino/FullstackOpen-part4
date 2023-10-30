const listHelper = require('../utils/list_helper')
const blogs = require('../utils/mockBlogs').blogs

describe('favourite blog', () => {
  test('the best blog is', () => {
    const result = listHelper.favouriteBlog(blogs)
    expect(result).toEqual(blogs[2])
  })
})