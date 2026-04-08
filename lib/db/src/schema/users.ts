import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  age: integer("age"),
  occupation: text("occupation"),
  about: text("about"),
  avatar: text("avatar"),
  interests: text("interests").array().notNull().default([]),
  skills: text("skills").array().notNull().default([]),
  preferredGroupSize: text("preferred_group_size").notNull().default("one_on_one"),
  totalSessions: integer("total_sessions").notNull().default(0),
  totalHours: real("total_hours").notNull().default(0),
  rating: real("rating").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
