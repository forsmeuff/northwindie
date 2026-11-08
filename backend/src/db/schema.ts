import {pgTable, text, integer, timestamp,  uuid, boolean, jsonb} from "drizzle-orm/pg-core";
import {defineRelations} from "drizzle-orm";

export type OrderStatus = "pending" | "paid" | "failed";
export type UserRole = "customer" | "support" | "admin";

export type CheckoutSessionLine = {
    productId: string;
    quantity: number;
    unitPriceCents: number;
}



export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    email: text("email").notNull().default(""),
    display_name: text("display_name"),
    role: text("role").notNull().$type<UserRole>().default("customer"),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {withTimezone: true}).notNull().defaultNow(),
})

export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    category: text("category").notNull().default("General"),
    description: text("description").notNull().default(""),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").notNull().default("usd"),
    imageUrl: text("image_url"),
    imageKitFileId: text("image_kit_file_id"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
})

export const checkoutSessions = pgTable("checkout_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
    polarCheckoutId: text("polar_checkout_id").notNull().unique(),
    lines: jsonb("lines").$type<CheckoutSessionLine[]>().notNull(),
    totalCents: integer("total_cents").notNull(),
    currency: text("currency").notNull(),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
})

//cascade here will delete all checkout sessions associated with a user if the user is deleted

export const orders = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
    status: text("status").$type<OrderStatus>().notNull().default("pending"),
    polarCheckoutId: text("polar_checkout_id"),
    polarOrderId: text("polar_order_id").unique(),
    totalCents: integer("total_cents").notNull().default(0),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {withTimezone: true}).defaultNow().notNull(),
})

export const orderItems = pgTable("order_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(()=>orders.id, {onDelete: "cascade"}),
    productId: uuid("product_id").notNull().references(()=>products.id, {onDelete: "cascade"}),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
})


export const relations = defineRelations({users, products, orders, orderItems, checkoutSessions}, (r) => ({
    users: {
        orders: r.many.orders({
        from: r.users.id,
        to: r.orders.userId,
        }),
        checkoutSessions: r.many.checkoutSessions({
            from: r.users.id,
            to: r.checkoutSessions.userId,
        })
},

    products:
    {
        have: r.many.orderItems({
            from: r.products.id,
            to: r.orderItems.productId,
        })
    },

    checkoutSessions: {
        user: r.one.users({
            from: r.checkoutSessions.userId,
            to: r.users.id,
        })
    },

    orders: {
        belongsTo: r.one.users({
            from: r.orders.userId,
            to: r.users.id,
        }),

        has: r.many.orderItems({
            from: r.orders.id,
            to: r.orderItems.orderId,
        })
    },

    orderItems: {
        belongsTo: r.one.orders({
            from: r.orderItems.orderId,
            to: r.orders.id,
        }),
        belongTo: r.one.products({
            from: r.orderItems.productId,
            to: r.products.id,
        })
    },


})
)