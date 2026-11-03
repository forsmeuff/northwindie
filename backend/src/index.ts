import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkWebhookHanlder } from "./webhooks/clerk";
import {clerkMiddleware} from "@clerk/express";
import { getEnv } from "./lib/env";

// const nayme:string = "John";

// console.log(nayme);
const rawJson = express.raw({ type:"application/json", limit: "1mb" })

// its is important that you don't parse the webhook data, just keep it raw

const env = getEnv();
const app = express();

app.post("/webhooks/clerk", rawJson, (req,res) => {
    void clerkWebhookHandler(req, res);
})



app.use(express.json())
app.use(clerkMiddleware())
app.use(cors())



app.listen(env.PORT, ()=>{console.log("listening on port 3001 ...")});