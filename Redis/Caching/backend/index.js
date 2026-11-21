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

  let cachedProducts = await redis.get("product:all")

  if (cachedProducts) {
    console.log("Cache hit")
    cachedProducts = await JSON.parse(cachedProducts)
    return res.status(200).json(cachedProducts)
  }

  console.log("Cache miss")

  const products = await Product.find().sort({
    createdAt: -1
  });

  await redis.set("product:all", JSON.stringify(products))

  return res.status(200).json(products);
});


app.post('/api/products', async (req, res) => {

  const product = await Product.create(req.body);

  await redis.del("product:all") // Cache invalidation

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
  await redis.del("product:all") // Cache invalidation

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
  await redis.del("product:all") // Cache invalidation

  return res.status(204).json({ message: "Product deleted" });
});

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