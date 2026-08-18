import { sendCustomerBookingReminder } from '../../lib/booking-notification';
import { readBookings, writeBookings } from '../../lib/bookings-store';

const HOUR = 60 * 60 * 1000;

export default async () => {
  const now = Date.now();
  const bookings = await readBookings();
  let changed = false;
  let sent = 0;

  for (const booking of bookings) {
    if (booking.status !== 'confirmed' || !booking.email || booking.reminderSentAt) continue;

    const appointment = new Date(`${booking.date}T${booking.time}:00+03:00`).getTime();
    const hoursUntilAppointment = (appointment - now) / HOUR;
    if (hoursUntilAppointment < 23 || hoursUntilAppointment > 25) continue;

    try {
      const result = await sendCustomerBookingReminder(booking);
      if (result.sent) {
        booking.reminderSentAt = new Date().toISOString();
        changed = true;
        sent += 1;
      }
    } catch (error) {
      console.error('Booking reminder email error', booking.id, error);
    }
  }

  if (changed) await writeBookings(bookings);
  console.log(`Booking reminder check completed. Sent: ${sent}`);
};

export const config = {
  schedule: '@hourly',
};
