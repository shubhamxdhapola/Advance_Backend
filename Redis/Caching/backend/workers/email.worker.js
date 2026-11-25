import 'dotenv/config'
import { Worker } from "bullmq";
import { sendEmail } from "../lib/send.email.js";
import bullmqConnection from "../config/bullmq.js";

export const emailWorker = new Worker(
    'email-queue',
    async (job) => {
        console.log("Job ID : ", job?.id)
        console.log("Job Name : ", job?.name)
        const email = job.data?.to
        const message = job.data?.message
        await sendEmail(email, message)
    }, {
    connection: bullmqConnection,
    concurrency: 5
})

emailWorker.on("ready", () => {
    console.log("Email worker is ready and waiting for jobs...");
});

emailWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

emailWorker.on("error", (err) => {
    console.error("Worker error:", err);
});

emailWorker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message);
});