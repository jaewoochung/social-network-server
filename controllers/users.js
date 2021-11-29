const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  console.log(authorization)
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    console.log(authorization.substring(7))
		return authorization.substring(7)
	}
	return null
}

usersRouter.post('/', async (request, response) => {
  const body = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save()
  response.json(savedUser)
})

// Creating a friend request
usersRouter.post('/:id', async (request, response) => {
  const body = request.body
  const token = getTokenFrom(request)

  const decodedToken = jwt.verify(token, process.env.SECRET)
	if (!token || !decodedToken.id) {
		return response.status(401).json({ error: 'token missing or invalid' })
	}

  await User.findByIdAndUpdate(request.params.id, {$push: {friendRequests: decodedToken.id}})
  response.json(204).end()
})

usersRouter.post('/accept/:id', async (request, response) => {
  const body = request.body

  decodedToken = jwt.verify(body.cookieToken, process.env.SECRET)

  // add the users into their friends list
  const user = await User.findByIdAndUpdate(decodedToken.id, {$push: { friends: request.params.id }})
  const friend = await User.findByIdAndUpdate(request.params.id, {$push: { friends: decodedToken.id }})
  
  // Delete the friend Requests
  const filteredUser = await User.findByIdAndUpdate(decodedToken.id, {
    $pull: { friendRequests: request.params.id }
  })
  const filteredFriend = await User.findByIdAndUpdate(request.params.id, {
    $pull: { friendRequests: decodedToken.id }
  })
  
  response.json(204).end()
})

usersRouter.get('/requester/:id', async (request, response) => {
  const user = await User.findById(request.params.id)
  
  return response.json(user)
})

usersRouter.get('/getUser', async (request, response) => {
  const body = request.body

  const token = request.get('authorization')

  decodedToken = jwt.verify(token, process.env.SECRET)

  const user = await User.findById(decodedToken.id)

  return response.json(user)
})

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('posts', { content: 1, date: 1 })

  response.json(users.map(u => u.toJSON()))
})

usersRouter.delete('/:id', async (request, response) => {
  await User.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = usersRouter
