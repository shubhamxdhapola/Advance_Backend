import Redis from "ioredis";

const bullmqConnection = new Redis(
    process.env.REDIS_URL,
    {
        maxRetriesPerRequest: null,
    }
);

export default bullmqConnection;