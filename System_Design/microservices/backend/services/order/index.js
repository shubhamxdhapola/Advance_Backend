import 'dotenv/config'
import express from 'express'

const app = express()
const PORT = process.env.PORT || 5002

app.use('/', (req, res) => {
    return res.status(200).json({ message: `Hello from Order Service` })
})

app.listen(PORT, () => {
    console.log(`Server is listening at ${PORT}`)
})
