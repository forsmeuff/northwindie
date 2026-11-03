import type {Request, Response} from "express";
import { getEnv } from "../lib/env";
import {verifyWebhook} from "@clerk/backend/webhooks";
import { parseRole } from "../lib/roles";
import { db } from "../db";
import { users } from "../db/schema";
export async function clerkWebhookHanlder(req:Request, res:Response){
    const env = getEnv();

    try {
        //needs the webhook secret to know we are getting trusted incoming posts
        if(!env.CLERK_WEBHOOK_SECRET){
            res.status(503).send("Webhooks not configured");   
        }

        const payload = req.body instanceof Buffer ? req.body.toString("utf8") : String(req.body);

        const request = new Request("http://internal/webhooks/clerk", {
            method: "POST",
            headers: new Headers(req.headers as HeadersInit),
            body: payload,
        });

        const evt = await verifyWebhook(request, { signingSecret: env.CLERK_WEBHOOK_SECRET});

        if(evt.type === "user.created" || evt.type === "user.updated"){
            const u = evt.data;

            const email = u.email_addresses?.find((e)=> e.id === u.primary_email_address_id)?.email_address ?? u.email_addresses?.[0]?.email_address;

            const displayName = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || null;

            const role = parseRole(u.public_metadata?.role);
                
            await db.insert(users).values({
                clerkUserId: u.id,
                email: email,
                displayName,
                role
            }
            ).onConflictDoUpdate({target:users})
            
        }

    }
    catch(error){

    }
}