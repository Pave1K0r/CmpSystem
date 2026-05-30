import express from 'express'
import cors from 'cors'
import login from './login.js'
import house from './house.js'
import cost from './cost.js'
import repair from './repair.js'
import complaint from './complaint.js'
import user from './user.js'
import notice from './notice.js'

const app = express()
const port = 11451

app.use(cors())
app.use(express.json())

app.use('/api', login)
app.use('/api', house)
app.use('/api', cost)
app.use('/api', repair)
app.use('/api', complaint)
app.use('/api', user)
app.use('/api', notice)

app.listen(port, () => {})
