import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { connectToDatabase } from './config/db.js';
import { Product } from './models/product.model.js';
import { createClient } from 'redis';

const app = express();
app.use(express.json({ limit: '10kb' }));

const redis = createClient({
  url: process.env.REDIS_URL
})

await redis.connect();

app.get('/api/products', async (_req, res) => {

  // Fetch from cache memory
  const cachedProducts = await JSON.parse(await redis.get("product:all")) 

  if (cachedProducts) { // If found -> return
    console.log("Cache hit")
    return res.status(200).json(cachedProducts)
  }

  // If not found in cache
  console.log("Cache miss")

  const products = await Product.find().sort({
    createdAt: -1
  });

  // Store in cache
  await redis.set("product:all", JSON.stringify(products))

  return res.status(200).json(products);

});


app.post('/api/products', async (req, res) => {

  const product = await Product.create(req.body);

  await redis.del("product:all") // Cache invalidation => Remove the old cache

  return res.status(201).json(product);

});


app.patch('/api/products/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    returnDocument: 'after',
  });
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  await redis.del("product:all") // Cache invalidation  => Remove the old cache

  return res.status(200).json(product);

});


app.delete('/api/products/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  await redis.del("product:all") // Cache invalidation => Remove the old cache

  return res.status(204).json({ message: "Product deleted" });
});


app.post('/send-otp', async (req, res) => {
  const { phone } = req.body
  const otp = Math.floor(100000 + Math.random() * 900000).toString() // Generate the OTP

  // Store the OTP in redis for 5 minutes(300s)
  await redis.set(
    `otp:${phone}`, JSON.stringify(otp),
    { EX: 300 }
  )

  return res.status(201).json({ message: `OTP : ${otp} sent to ${phone}` })
})

app.post('/verify-otp', async (req, res) => {

  const { phone, enteredOtp } = req.body

  // Get the stored otp
  const sentOtp = await JSON.parse(await redis.get(`otp:${phone}`))

  if (sentOtp === null) {
    return res.status(404).json({ message: "OTP expired" })
  }

  if (sentOtp !== enteredOtp) {
    return res.status(401).json({ message: "OTP invalid" })
  }
  await redis.del(`otp:${phone}`) // Delete otp after verification
  return res.status(200).json({ message: "OTP verified successfully" })
  
})

const port = Number(process.env.PORT) || 3000;

try {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`Product API listening on port ${port}`);
  });
} catch (err) {
  console.error('Failed to start Product API:', err);
  process.exitCode = 1;
}