import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  LoginUserBody,
  LoginUserResponse,
  GetProfileResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
  GetStatsSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/users/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, name, avatar } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (existing.length > 0) {
    const user = existing[0];
    res.json(LoginUserResponse.parse(user));
    return;
  }

  const [user] = await db
    .insert(usersTable)
    .values({ email, name, avatar: avatar ?? null, interests: [], skills: [], preferredGroupSize: "one_on_one" })
    .returning();

  res.json(LoginUserResponse.parse(user));
});

router.get("/users/profile", async (req, res): Promise<void> => {
  const userId = parseInt(req.headers["x-user-id"] as string || "1", 10);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(GetProfileResponse.parse(user));
});

router.patch("/users/profile", async (req, res): Promise<void> => {
  const userId = parseInt(req.headers["x-user-id"] as string || "1", 10);

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, userId))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(UpdateProfileResponse.parse(user));
});

router.get("/stats/summary", async (req, res): Promise<void> => {
  const userId = parseInt(req.headers["x-user-id"] as string || "1", 10);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  if (!user) {
    res.json(GetStatsSummaryResponse.parse({
      totalSessions: 0,
      totalHoursStudied: 0,
      averageRating: 0,
      topSubject: null,
      completedThisWeek: 0,
      activeGroups: 0,
    }));
    return;
  }

  res.json(GetStatsSummaryResponse.parse({
    totalSessions: user.totalSessions,
    totalHoursStudied: user.totalHours,
    averageRating: user.rating,
    topSubject: user.interests.length > 0 ? user.interests[0] : null,
    completedThisWeek: Math.floor(user.totalSessions / 4),
    activeGroups: 0,
  }));
});

export default router;
