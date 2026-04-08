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
    const mockStudents = [
      { id: 99, name: "Alex K.", avatar: null, subject, distanceKm: 0.3, groupSize, interests: ["Coding", "Maths"], rating: 4.7, latitude: latitude + 0.001, longitude: longitude + 0.001 },
      { id: 98, name: "Priya S.", avatar: null, subject, distanceKm: 0.8, groupSize, interests: ["Physics", subject], rating: 4.9, latitude: latitude - 0.002, longitude: longitude + 0.003 },
      { id: 97, name: "Jamie L.", avatar: null, subject, distanceKm: 1.2, groupSize, interests: [subject, "Biology"], rating: 4.5, latitude: latitude + 0.003, longitude: longitude - 0.001 },
    ];
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

  const mockStudents = [
    { id: 99, name: "Alex K.", avatar: null, subject: params.data.subject ?? "Maths", distanceKm: 0.3, groupSize: "two_to_five", interests: ["Coding", "Maths"], rating: 4.7, latitude: 50.001, longitude: 8.001 },
    { id: 98, name: "Priya S.", avatar: null, subject: params.data.subject ?? "Physics", distanceKm: 0.8, groupSize: "two_to_five", interests: ["Physics", "Chemistry"], rating: 4.9, latitude: 49.998, longitude: 8.003 },
    { id: 97, name: "Jamie L.", avatar: null, subject: params.data.subject ?? "Coding", distanceKm: 1.2, groupSize: "five_to_ten", interests: ["Coding", "Biology"], rating: 4.5, latitude: 50.003, longitude: 7.999 },
    { id: 96, name: "Sam R.", avatar: null, subject: params.data.subject ?? "Chemistry", distanceKm: 1.9, groupSize: "two_to_five", interests: ["Chemistry", "Maths"], rating: 4.6, latitude: 50.005, longitude: 8.005 },
  ];

  res.json(GetNearbyStudentsResponse.parse(mockStudents));
});

export default router;
