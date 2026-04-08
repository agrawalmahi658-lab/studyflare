import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, studySessionsTable, feedbackTable, usersTable } from "@workspace/db";
import {
  CreateSessionBody,
  GetSessionParams,
  GetSessionResponse,
  UpdateSessionParams,
  UpdateSessionBody,
  UpdateSessionResponse,
  ListSessionsResponse,
  SubmitFeedbackParams,
  SubmitFeedbackBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sessions", async (req, res): Promise<void> => {
  const userId = parseInt(req.headers["x-user-id"] as string || "1", 10);

  const sessions = await db
    .select()
    .from(studySessionsTable)
    .where(eq(studySessionsTable.hostUserId, userId))
    .orderBy(studySessionsTable.createdAt);

  res.json(ListSessionsResponse.parse(sessions));
});

router.post("/sessions", async (req, res): Promise<void> => {
  const userId = parseInt(req.headers["x-user-id"] as string || "1", 10);

  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [session] = await db
    .insert(studySessionsTable)
    .values({
      subject: parsed.data.subject,
      hostUserId: userId,
      partnerUserId: parsed.data.partnerUserId ?? null,
      status: "pending",
    })
    .returning();

  res.status(201).json(GetSessionResponse.parse(session));
});

router.get("/sessions/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetSessionParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db
    .select()
    .from(studySessionsTable)
    .where(eq(studySessionsTable.id, params.data.id));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.json(GetSessionResponse.parse(session));
});

router.patch("/sessions/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateSessionParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status) {
    updateData.status = parsed.data.status;
    if (parsed.data.status === "active") {
      updateData.startedAt = new Date();
    } else if (parsed.data.status === "completed" || parsed.data.status === "cancelled") {
      updateData.endedAt = new Date();
    }
  }
  if (parsed.data.durationMinutes != null) {
    updateData.durationMinutes = parsed.data.durationMinutes;
  }

  const [session] = await db
    .update(studySessionsTable)
    .set(updateData)
    .where(eq(studySessionsTable.id, params.data.id))
    .returning();

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  if (parsed.data.status === "completed") {
    const durationHours = (parsed.data.durationMinutes ?? 25) / 60;
    const userId = parseInt(req.headers["x-user-id"] as string || "1", 10);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (user) {
      await db.update(usersTable)
        .set({
          totalSessions: user.totalSessions + 1,
          totalHours: parseFloat((user.totalHours + durationHours).toFixed(2)),
        })
        .where(eq(usersTable.id, userId));
    }
  }

  res.json(UpdateSessionResponse.parse(session));
});

router.post("/sessions/:id/feedback", async (req, res): Promise<void> => {
  const userId = parseInt(req.headers["x-user-id"] as string || "1", 10);

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = SubmitFeedbackParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = SubmitFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [feedback] = await db
    .insert(feedbackTable)
    .values({
      sessionId: params.data.id,
      reviewerUserId: userId,
      reviewedUserId: parsed.data.reviewedUserId,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    })
    .returning();

  const allFeedback = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.reviewedUserId, parsed.data.reviewedUserId));

  if (allFeedback.length > 0) {
    const avg = allFeedback.reduce((acc, f) => acc + f.rating, 0) / allFeedback.length;
    await db.update(usersTable)
      .set({ rating: parseFloat(avg.toFixed(2)) })
      .where(eq(usersTable.id, parsed.data.reviewedUserId));
  }

  res.status(201).json(feedback);
});

export default router;
