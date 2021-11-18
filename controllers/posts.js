const postsRouter = require('express').Router()
const Post = require('../models/post')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		return authorization.substring(7)
	}
	return null
}

postsRouter.get('/', async (request, response) => {
  const posts = await Post
    .find({}).populate('user')

  response.json(posts.map(post => post.toJSON()))
})

postsRouter.post('/', async (request, response) => {
  const body = request.body

	/* const token = getTokenFrom(request)
	   const decodedToken = jwt.verify(token, process.env.SECRET)
	   if (!token || !decodedToken.id) {
		 return response.status(401).json({ error: 'token missing or invalid' })
	   } */
	
  const user = await User.findById('6192ea4ee94985dbf668fb0a')

  const post = new Post({
    content: body.content,
    comments: body.comments,
    date: new Date(),
    user: user,
    likes: 0
  })

  const savedPost = await post.save()
  /* user.posts = user.posts.concat(savedPost._id)
   * await user.save() */

  response.json(savedPost.toJSON())
})

postsRouter.delete('/:id', async (request, response) => {
  await Post.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = postsRouter
