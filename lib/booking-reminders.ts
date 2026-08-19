import { sendCustomerBookingReminder } from './booking-notification';
import { markBookingReminderSent, readBookings } from './bookings-store';

const HOUR = 60 * 60 * 1000;

export async function runBookingReminders() {
  const now = Date.now();
  const bookings = await readBookings();
  let sent = 0;

  for (const booking of bookings) {
    if (booking.status !== 'confirmed' || !booking.email || booking.reminderSentAt) continue;
    const appointment = new Date(`${booking.date}T${booking.time}:00+03:00`).getTime();
    const hoursUntilAppointment = (appointment - now) / HOUR;
    if (hoursUntilAppointment < 23 || hoursUntilAppointment > 25) continue;

    try {
      const result = await sendCustomerBookingReminder(booking);
      if (result.sent) {
        await markBookingReminderSent(booking.id, new Date().toISOString());
        sent += 1;
      }
    } catch (error) {
      console.error('Booking reminder email error', booking.id, error);
    }
  }
  return { checked: bookings.length, sent };
}
