import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, studyGroupsTable, groupMembersTable } from "@workspace/db";
import {
  ListGroupsQueryParams,
  ListGroupsResponse,
  CreateGroupBody,
  JoinGroupParams,
  JoinGroupResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/groups", async (req, res): Promise<void> => {
  const params = ListGroupsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let groups;
  if (params.data.subject) {
    groups = await db.select().from(studyGroupsTable).where(eq(studyGroupsTable.subject, params.data.subject));
  } else {
    groups = await db.select().from(studyGroupsTable);
  }

  res.json(ListGroupsResponse.parse(groups));
});

router.post("/groups", async (req, res): Promise<void> => {
  const userId = parseInt(req.headers["x-user-id"] as string || "1", 10);

  const parsed = CreateGroupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [group] = await db
    .insert(studyGroupsTable)
    .values({
      name: parsed.data.name,
      subject: parsed.data.subject,
      description: parsed.data.description ?? null,
      maxMembers: parsed.data.maxMembers,
      currentMembers: 1,
      createdByUserId: userId,
    })
    .returning();

  await db.insert(groupMembersTable).values({ groupId: group.id, userId });

  res.status(201).json(group);
});

router.post("/groups/:id/join", async (req, res): Promise<void> => {
  const userId = parseInt(req.headers["x-user-id"] as string || "1", 10);

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = JoinGroupParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [group] = await db.select().from(studyGroupsTable).where(eq(studyGroupsTable.id, params.data.id));

  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  if (group.currentMembers >= group.maxMembers) {
    res.status(400).json({ error: "Group is full" });
    return;
  }

  await db.insert(groupMembersTable).values({ groupId: group.id, userId }).onConflictDoNothing();

  const [updated] = await db
    .update(studyGroupsTable)
    .set({ currentMembers: group.currentMembers + 1 })
    .where(eq(studyGroupsTable.id, group.id))
    .returning();

  res.json(JoinGroupResponse.parse(updated));
});

export default router;
