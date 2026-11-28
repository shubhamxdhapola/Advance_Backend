import 'dotenv/config'
import express from 'express'
import proxy from 'express-http-proxy'

const app = express()
const PORT = process.env.PORT || 5000

app.use('/', (req, res) => {
    return res.status(200).json({ message: `Hello from  API Gateway` })
})

app.use('/api/auth', proxy('http://localhost:8001'))
app.use('/api/order', proxy('http://localhost:8002'))
app.use('/api/product', proxy('http://localhost:8003'))

app.listen(PORT, () => {
    console.log(`Server is listening at ${PORT}`)
})
