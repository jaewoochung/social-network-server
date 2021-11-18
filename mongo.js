const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@clusterfullstack.kki4g.mongodb.net/social-network?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
          console.log('connected to MongoDB')
        })

const postSchema = new mongoose.Schema({
  user: String,
  content: String,
  comments: Array,
  date: Date,
  likes: Number,
})

const Post = mongoose.model('Post', postSchema)

const post = new Post({
  user: "Jaewoo Chung",
  content: "Celtics may need to make s",
  comments: [{comment: "I agree Jaewoo", user: "Stephen Yu"}],
  date: new Date(),
  likes: 43
})

const secondPost = new Post({
  user: "Calvin Kattar",
  content: "My prediction for the NBA finals is Nets vs Warriors",
  comments: [{comment: "RATIO", user: "Kevin Wu"}],
  date: new Date(),
  likes: 41
})

secondPost.save().then(result => {
   console.log('Post saved!')
   mongoose.connection.close()
 })

Post.find({}).then(result => {
  result.forEach(post => {
    console.log(post)
  })
  mongoose.connection.close()
})
