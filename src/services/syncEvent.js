const { google } = require("googleapis");
const User = require("../models/user");
const Event = require("../models/event");

// Get user's Google calendar service
async function getGoogleCalendarService(user) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials(user.googleTokens); // Get tokens from DB
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  return calendar;
}

// Sync events
async function syncEvents(user) {
  const calendar = await getGoogleCalendarService(user);
  const userEvents = await Event.find({ createdBy: user._id });
  console.log(userEvents);
  for (const event of userEvents) {
    const googleEvent = {
      summary: event.title,
      description: event.description || "",
      location: event.location || "",
      start: {
        dateTime: event.startTime,
        timeZone: "UTC",
      },
      end: {
        dateTime: event.endTime,
        timeZone: "UTC",
      },
      attendees: event.attendees.map((attendee) => ({
        email: attendee.email,
      })),
      visibility: event.visibility.toLowerCase(),
    };
    try {
      // Create or update the event in Google Calendar
      await calendar.events.insert({
        calendarId: "primary",
        resource: googleEvent,
      });
    } catch (error) {
      console.error("Error syncing event:", error);
    }
  }
}

module.exports = { syncEvents };
