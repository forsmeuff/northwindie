import express from "express";
import cors from "cors";
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import { clerkWebhookHandler } from "./webhooks/clerk";
import {clerkMiddleware} from "@clerk/express";
import { getEnv } from "./lib/env";

import keepAliveCron from "./lib/cron";

import meRouter from "./routes/meRouter";
import productRouter from "./routes/productRouter";
import streamRouter from "./routes/streamRouter";
// const nayme:string = "John";

// console.log(nayme);
const rawJson = express.raw({ type:"application/json", limit: "1mb" })

// its is important that you don't parse the webhook data, just keep it raw

const env = getEnv();
const app = express();

app.post("/webhooks/clerk", rawJson, (req,res) => {
    void clerkWebhookHandler(req, res);
})


app.use(express.json());
app.use(clerkMiddleware());
app.use(cors());

app.get("/health", (_req, res)=>{
    res.json({ok: true });

});

app.use("/api/me", meRouter);
app.use("/api/products", productRouter);
app.use("/api/stream", streamRouter);
const publicDir = path.join(process.cwd(), "public");

if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir));

    app.get("/{*any}", (req, res, next)=>{
        if(req.method!== "GET" && req.method!=="HEAD"){
            next();
            return;
        }

        if(req.path.startsWith("/api") || req.path.startsWith("/webhooks")){
            next();
            return;

        }

        res.sendFile(path.join(publicDir, "index.html"), (err)=>next(err));

    });

}

// todo : add error handler middleware


app.listen(env.PORT, ()=>{console.log("listening on port 3001 ...");
    if(env.NODE_ENV==="production"){
        keepAliveCron.start();
    }
});