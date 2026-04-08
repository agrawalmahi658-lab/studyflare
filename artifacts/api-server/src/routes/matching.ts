import { Router, type IRouter } from "express";
import { gt, eq } from "drizzle-orm";
import { db, broadcastsTable, usersTable } from "@workspace/db";
import {
  BroadcastAvailabilityBody,
  BroadcastAvailabilityResponse,
  GetNearbyStudentsQueryParams,
  GetNearbyStudentsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const INDIAN_MOCK_STUDENTS = [
  { id: 99, name: "Arjun Sharma", avatar: null, distanceKm: 0.3, interests: ["Maths", "Coding"], rating: 4.8 },
  { id: 98, name: "Priya Patel", avatar: null, distanceKm: 0.7, interests: ["Physics", "Chemistry"], rating: 4.9 },
  { id: 97, name: "Riya Nair", avatar: null, distanceKm: 1.1, interests: ["Biology", "Chemistry"], rating: 4.6 },
  { id: 96, name: "Karan Mehta", avatar: null, distanceKm: 1.5, interests: ["Coding", "Economics"], rating: 4.7 },
  { id: 95, name: "Ananya Iyer", avatar: null, distanceKm: 1.9, interests: ["Literature", "History"], rating: 4.5 },
  { id: 94, name: "Vikram Rao", avatar: null, distanceKm: 2.2, interests: ["Maths", "Physics"], rating: 4.8 },
];

router.post("/matching/broadcast", async (req, res): Promise<void> => {
  const userId = parseInt(req.headers["x-user-id"] as string || "1", 10);

  const parsed = BroadcastAvailabilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { subject, latitude, longitude, groupSize, durationMinutes } = parsed.data;

  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

  const [broadcast] = await db
    .insert(broadcastsTable)
    .values({ userId, subject, latitude, longitude, groupSize, durationMinutes, expiresAt })
    .returning();

  const now = new Date();
  const activeBroadcasts = await db
    .select()
    .from(broadcastsTable)
    .where(gt(broadcastsTable.expiresAt, now));

  const nearby = [];
  for (const b of activeBroadcasts) {
    if (b.userId === userId) continue;
    const km = distanceKm(latitude, longitude, b.latitude, b.longitude);
    if (km > 50) continue;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, b.userId));
    if (!user) continue;

    nearby.push({
      id: user.id,
      name: user.name,
      avatar: user.avatar ?? null,
      subject: b.subject,
      distanceKm: parseFloat(km.toFixed(2)),
      groupSize: b.groupSize,
      interests: user.interests,
      rating: user.rating,
      latitude: b.latitude,
      longitude: b.longitude,
    });
  }

  if (nearby.length === 0) {
    const mockStudents = INDIAN_MOCK_STUDENTS.slice(0, 4).map((s, i) => ({
      ...s,
      subject,
      groupSize,
      latitude: latitude + (0.001 * (i + 1)),
      longitude: longitude + (0.002 * (i + 1)),
    }));
    res.json(BroadcastAvailabilityResponse.parse({ broadcastId: broadcast.id, matches: mockStudents }));
    return;
  }

  res.json(BroadcastAvailabilityResponse.parse({ broadcastId: broadcast.id, matches: nearby }));
});

router.get("/matching/nearby", async (req, res): Promise<void> => {
  const params = GetNearbyStudentsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const subject = params.data.subject ?? "General";

  const mockStudents = INDIAN_MOCK_STUDENTS.map((s) => ({
    ...s,
    subject,
    groupSize: "two_to_five",
    latitude: 28.6 + Math.random() * 0.05,
    longitude: 77.2 + Math.random() * 0.05,
  }));

  res.json(GetNearbyStudentsResponse.parse(mockStudents));
});

export default router;
