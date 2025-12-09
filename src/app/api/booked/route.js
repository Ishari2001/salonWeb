import { getDBPool } from "../../../../lib/db";

const serviceSeatLimits = {
  "Hair Cut": 2,
  "Pedicure": 2,
  "Hair Coloring": 2,
  "Facial": 2,
  "Manicure": 2,
  "Hair Spa": 2,
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    let date = searchParams.get("date")?.trim();
    let service = searchParams.get("service")?.trim();

    if (!date || !service) {
      return new Response(JSON.stringify({ error: "Date and service required" }), { status: 400 });
    }

    if (!serviceSeatLimits[service]) {
      return new Response(JSON.stringify({ error: "Invalid service" }), { status: 400 });
    }

    const seatLimit = serviceSeatLimits[service];
    const pool = getDBPool();

    // Fetch bookings for the given date & service
    const [rows] = await pool.execute(
      `SELECT appointment_time FROM bookings WHERE appointment_date=? AND service=?`,
      [date, service]
    );

    // Count bookings per time slot
    const bookedCounts = {};
    rows.forEach((r) => {
      const time = r.appointment_time;
      bookedCounts[time] = (bookedCounts[time] || 0) + 1;
    });

    // Find slots where all seats are full
    const fullSlots = Object.keys(bookedCounts).filter((time) => bookedCounts[time] >= seatLimit);

    return new Response(JSON.stringify({ bookedCounts, fullSlots, seatLimit }), { status: 200 });
  } catch (err) {
    console.error("Booked API Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
