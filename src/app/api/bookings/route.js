import { getDBPool } from "../../../../lib/db";

const serviceDurations = {
  "Hair Cut": 60,
  "Pedicure": 90,
  "Hair Coloring": 120,
  "Facial": 60,
  "Manicure": 60,
  "Hair Spa": 90,
};

const serviceSeatLimits = {
  "Hair Cut": 2,
  "Pedicure": 2,
  "Hair Coloring": 2,
  "Facial": 2,
  "Manicure": 2,
  "Hair Spa": 2,
};

const SALON_OPEN = 9;  // 9 AM
const SALON_CLOSE = 17; // 5 PM
const DAILY_LIMIT_MINUTES = 480; // 8 hours

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export async function POST(req) {
  try {
    const data = await req.json();
    let { full_name, email, service, appointment_date, appointment_time } = data;

    full_name = full_name?.trim();
    email = email?.trim();
    service = service?.trim();
    appointment_date = appointment_date?.trim();
    appointment_time = appointment_time?.trim();

    if (!full_name || !email || !service || !appointment_date || !appointment_time) {
      return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
    }

    const duration = serviceDurations[service];
    if (!duration) return new Response(JSON.stringify({ error: "Invalid service" }), { status: 400 });

    // Check salon hours
    const [h, m] = appointment_time.split(":").map(Number);
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + duration;

    if (h < SALON_OPEN || endMinutes > SALON_CLOSE * 60) {
      return new Response(
        JSON.stringify({ error: "Service must be within salon hours (9 AM - 5 PM)" }),
        { status: 400 }
      );
    }

    const pool = getDBPool();
    const seatLimit = serviceSeatLimits[service] ?? 1;

    // Fetch existing bookings for the service and date
    const [existingRows] = await pool.execute(
      `SELECT appointment_time, service FROM bookings WHERE appointment_date=?`,
      [appointment_date]
    );

    // 1️⃣ Check overlapping bookings per time slot
    let overlapCount = 0;
    for (const row of existingRows) {
      if (row.service !== service) continue; // Only check same service for seat limit
      const existingStart = timeToMinutes(row.appointment_time);
      const existingEnd = existingStart + serviceDurations[row.service];
      if (Math.max(existingStart, startMinutes) < Math.min(existingEnd, endMinutes)) {
        overlapCount++;
      }
    }

    if (overlapCount >= seatLimit) {
      return new Response(
        JSON.stringify({ error: `All ${seatLimit} seats are already booked for ${service} at this time` }),
        { status: 409 }
      );
    }

    // 2️⃣ Check total daily limit (sum all booked durations)
    let totalBookedMinutes = 0;
    existingRows.forEach(row => {
      const rowDuration = serviceDurations[row.service];
      totalBookedMinutes += rowDuration;
    });

    if (totalBookedMinutes + duration > DAILY_LIMIT_MINUTES) {
      return new Response(
        JSON.stringify({ error: `Cannot book ${service}. Salon daily limit of 8 hours reached.` }),
        { status: 409 }
      );
    }

    // Insert booking
    await pool.execute(
      `INSERT INTO bookings (full_name, email, service, appointment_date, appointment_time)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, service, appointment_date, appointment_time]
    );

    return new Response(JSON.stringify({ success: true, message: "Booking saved" }), { status: 201 });

  } catch (err) {
    console.error("Booking API Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
