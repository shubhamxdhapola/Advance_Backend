import 'dotenv/config'
import express from 'express'

const app = express()
const PORT = process.env.PORT || 5001

app.use('/api', (req, res) => {
    return res.status(200).json({ message: `Hello from ${process.env.SERVER_NAME}` })
})

app.listen(PORT, () => {
    console.log(`Server is listening at ${PORT}`)
})
