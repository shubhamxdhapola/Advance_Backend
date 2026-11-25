import { Queue } from "bullmq"
import bullmqConnection from "../config/bullmq.js"

export const emailQueue = new Queue('email-queue', { 
    connection: bullmqConnection 
})