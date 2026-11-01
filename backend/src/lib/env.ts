import {z} from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().min(1),

    CLERK_PUBLISHABLE_KEY: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().optional(),

    FRONTEND_URL: z.url(),
    SENTRY_DSN: z.string().optional(),
    STREAM_API_KEY: z.string().min(1),
    STREAM_API_SECRET: z.url(),

    IMAGEKIT_PUBLIC_KEY: z.string().min(1),
    IMAGE_PRIVATE_KEY: z.string().min(1),
    
    POLAR_ACCESS_TOKEN: z.string().min(1),
    POLAR_WEBHOOK_SECRET: z.string().min(1),
    POLAR_API_BASE: z.string().min(1)
})

export type Env = z.infer<typeof envSchema>

export function loadEnv(){
    const parsed = envSchema.safeParse(process.env)

    if(!parsed.success){
        const flat = z.treeifyError(parsed.error);
        console.log(flat.errors);
        console.log(flat.properties);

        throw new Error("Invalid env variables");
    }

    return parsed.data;
}

let cachedEnv: Env | null;

export function getEnv() {
    if(!cachedEnv){
        cachedEnv = loadEnv();
    }
    
    return cachedEnv;
}