import { getDBPool } from "../../../../lib/db";

// Seat limits per service
const serviceSeatLimits = {
  "Hair Cut": 2,
  "Pedicure": 2,
  "Hair Coloring": 2,
  "Facial": 2,
  "Manicure": 2,
  "Hair Spa": 2,
};

const maxDailyAppointments = 5;

export async function POST(req) {
  try {
    const data = await req.json();
    const { full_name, email, service, appointment_date, appointment_time } = data;

    // 1. Validation
    if (!full_name || !email || !service || !appointment_date || !appointment_time) {
      return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400 });
    }

    const pool = getDBPool();

    // 2. Check total daily appointments (all services)
    const [dailyRows] = await pool.execute(
      `SELECT COUNT(*) AS count FROM bookings WHERE appointment_date=?`,
      [appointment_date]
    );
    const dailyCount = dailyRows[0]?.count ?? 0;

    if (dailyCount >= maxDailyAppointments) {
      return new Response(
        JSON.stringify({ error: "Maximum 5 appointments reached for this date" }),
        { status: 409 }
      );
    }

    // 3. Check service seat limit per time slot
    const seatLimit = serviceSeatLimits[service] ?? 1;

    const [serviceRows] = await pool.execute(
      `SELECT COUNT(*) AS count FROM bookings WHERE appointment_date=? AND service=? AND appointment_time=?`,
      [appointment_date, service, appointment_time]
    );
    const serviceCount = serviceRows[0]?.count ?? 0;

    if (serviceCount >= seatLimit) {
      return new Response(
        JSON.stringify({ error: `Maximum ${seatLimit} appointments reached for ${service} at ${appointment_time} on this date` }),
        { status: 409 }
      );
    }

    // 4. Insert booking
    await pool.execute(
      `INSERT INTO bookings (full_name, email, service, appointment_date, appointment_time) VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, service, appointment_date, appointment_time]
    );

    return new Response(JSON.stringify({ success: true, message: "Booking saved" }), { status: 201 });
  } catch (err) {
    console.error("Booking API Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
