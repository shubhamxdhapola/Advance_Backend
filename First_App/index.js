import express from 'express'
import 'dotenv/config'

const app = express()
const PORT = process.env.PORT || 5001

app.use('/', (req, res) => {
    return res.status(200).json({ message: "Welcome" })
})

app.listen(PORT, () => {
    console.log("Server is listening")
})
