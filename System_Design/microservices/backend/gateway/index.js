import 'dotenv/config'
import express from 'express'
import proxy from 'express-http-proxy'

const app = express()
const PORT = process.env.PORT || 5000

app.use('/api/auth', proxy('http://auth:8000'))
app.use('/api/order', proxy('http://order:8000'))
app.use('/api/product', proxy('http://product:8000'))

app.use('/api', (req, res) => {
    return res.status(200).json({
        message: `Hello from  API Gateway ${process.env.GATEWAY_NAME}`
    })
})

app.listen(PORT, () => {
    console.log(`Server is listening at ${PORT}`)
})
