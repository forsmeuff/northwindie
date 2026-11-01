import express from "express";
import cors from "cors";
import {clerkMiddleware} from "@clerk/express";

// const nayme:string = "John";

// console.log(nayme);
const rawJson = express.raw({ type:"application/json", limit: "1mb" })

// its is important that you don't parse the webhook data, just keep it raw



app.post("/webhooks/clerk, rawJson, (req,res) => {
    void clerkWebhookHandler(req, res);
})

const app = express();

app.use(express.json())
app.use(clerkMiddleware())
app.use(cors())



app.listen(3001, ()=>{console.log("listening on port 3001 ...")});