import { redis } from "../config/redis.js"

export const rateLimiter = async (req, res, next) => {

    const ip = req.ip
    const key = `rate_limit:${ip}`

    const requests = await redis.incr(key) // Increment the count on each request

    if (requests === 1) {
        redis.expire(key, 60) // Set the IP block expiration time (1 Minute)
    }

    // Block ip if more than 5 request received
    if (requests > 5) {
        return res.status(429).json({ 
            message: "Too many requests" 
        })
    }

    next();
}