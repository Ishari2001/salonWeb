import { getDBPool } from "../../../../lib/db";

const serviceSeatLimits = {
  "Hair Cut": 2,
  "Pedicure": 2,
  "Hair Coloring": 2,
  "Facial": 2,
  "Manicure": 2,
  "Hair Spa": 2,
};

const maxDailyAppointments = 5;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const service = searchParams.get("service");

    if (!date || !service) {
      return new Response(JSON.stringify({ error: "Date and service required" }), { status: 400 });
    }

    const pool = getDBPool();

    // 1. All booked times for the service
    const [rows] = await pool.execute(
      `SELECT appointment_time FROM bookings WHERE appointment_date=? AND service=?`,
      [date, service]
    );

    const bookedCounts = {};
    rows.forEach(r => {
      bookedCounts[r.appointment_time] = (bookedCounts[r.appointment_time] || 0) + 1;
    });

    // 2. Compute fully booked slots for this service
    const fullyBookedSlots = Object.keys(bookedCounts).filter(
      time => bookedCounts[time] >= serviceSeatLimits[service]
    );

    // 3. Check daily total
    const [dailyRows] = await pool.execute(
      `SELECT COUNT(*) AS count FROM bookings WHERE appointment_date=?`,
      [date]
    );
    const dailyCount = dailyRows[0]?.count ?? 0;
    const fullyBookedDay = dailyCount >= maxDailyAppointments;

    return new Response(
      JSON.stringify({ bookedCounts, fullyBookedSlots, fullyBookedDay }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Booked API Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
