const Event = require("../models/event"); // Import Event model
const User = require("../models/user"); // Import User model
const { syncEvents } = require("../services/syncEvent");
const sendEmail = require("../../utils/sendEmail");
const { getAuthUrl, oauth2Client } = require("../config/googleAuth");
const { google } = require("googleapis");

// 📌 Create an Event
exports.createEvent = async (req, res) => {
  try {
    const attachments =
      req.files?.map((file) => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        originalname: file.originalname,
      })) || [];
    const event = new Event({
      ...req.body,
      attachments,
      createdBy: req.user.userId,
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
    console.log(error);
  }
};

// 📌 Get All Events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("attendees createdBy");
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get Event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "attendees createdBy"
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Update an Event
exports.updateEvent = async (req, res) => {
  try {
    const attachments =
      req.files?.map((file) => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        originalname: file.originalname,
      })) || [];

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        $push: { attachments: { $each: attachments } },
      },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Error updating event", error });
  }
};

// 📌 Delete an Event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.participateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: "User already participating" });
    }

    event.attendees.push(userId);
    await event.save();

    await sendEmail(
      user.email,
      `✅ Participation Confirmed: ${event.title}`,
      `Hello ${user.firstname},\n\nYou've successfully registered for the event: ${event.name}.\n\nThank you!`
    );

    res.status(200).json({
      message: "Participation successful, confirmation email sent.",
    });
  } catch (error) {
    console.error("Participation Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.cancelParticipation = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.user;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (!event.attendees.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is not participating in this event." });
    }

    event.attendees.pull(userId);
    await event.save();

    res.status(200).json({ message: "Participation cancelled successfully." });

    // Optional: Notify user via email (if needed)
    const user = await User.findById(userId);
    if (user?.email) {
      await sendEmail(
        user.email,
        `❌ Participation Cancelled: ${event.title}`,
        `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h3 style="color: #e53935;">You've cancelled your participation</h3>
            <p>Hi ${user.firstname},</p>
            <p>You've successfully withdrawn from <strong>${event.title}</strong>.</p>
            <p>If this was a mistake, feel free to join again anytime.</p>
          </div>
        `
      );
    }
  } catch (error) {
    console.error("Cancel Participation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.syncEvents = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (
      !user ||
      !user.googleTokens ||
      !user.googleTokens.access_token ||
      !user.googleTokens.refresh_token
    ) {
      // If the user doesn't have Google tokens, redirect to Google OAuth
      const googleAuthURL = getAuthUrl();
      return res.json({ googleAuthURL: googleAuthURL }); // Redirect to Google's OAuth consent page
    } else {
      oauth2Client.setCredentials({
        access_token: user.googleTokens.access_token,
        refresh_token: user.googleTokens.refresh_token,
        expiry_date: user.googleTokens.expiry_date,
      });

      // Refresh token if access token is expired
      try {
        const tokens = await oauth2Client.getAccessToken();
        if (tokens?.token && tokens?.res?.data) {
          const updatedTokens = tokens.res.data;

          // Save the refreshed tokens to DB
          await User.findByIdAndUpdate(user._id, {
            googleTokens: updatedTokens,
          });
        }
      } catch (error) {
        if (error.response?.data?.error == "invalid_grant") {
          const googleAuthURL = getAuthUrl();
          return res.status(401).json({
            message: "Google access has expired. Please reauthorize.",
            googleAuthURL,
          });
        }

        return res.status(500).json({
          message: error.message,
        });
      }
      await syncEvents(user);
      res.status(200).json({ message: "Events synced successfully" });
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
  }
};

exports.getUserEvents = async (req, res) => {
  try {
    const userId = req.params.userId;

    const events = await Event.find({
      $or: [{ createdBy: userId }, { attendees: { $in: [userId] } }],
    }).populate("attendees createdBy");

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user events",
      error: error.message,
    });
  }
};

exports.handleCallBack = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.v2.me.get();

    const user = await User.findOne({ email: userInfo.data.email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    let userUpdated = await User.findOneAndUpdate(
      { _id: user._id },
      { googleTokens: tokens },
      { new: true, upsert: true }
    );

    await syncEvents(userUpdated);

    res.status(200).json({ message: "Events synced successfully" });
  } catch (error) {
    console.error("Error during OAuth2 callback:", error);
    res.status(500).send("Error during Google authentication");
  }
};

exports.addParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userIds } = req.body; // userIds should be an array

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "userIds must be a non-empty array" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Filter out users already in attendees
    const newUserIds = userIds.filter((id) => !event.attendees.includes(id));

    if (newUserIds.length === 0) {
      return res
        .status(400)
        .json({ message: "All users are already participants" });
    }

    // Check if all userIds exist in the User collection
    const users = await User.find({ _id: { $in: newUserIds } });
    if (users.length !== newUserIds.length) {
      return res.status(404).json({ message: "One or more users not found" });
    }

    event.attendees.push(...newUserIds);
    await event.save();

    // Send email notification to each new participant
    for (const user of users) {
      if (user.email) {
        await sendEmail(
          user.email,
          `🎉 You have been added to the event: ${event.title}`,
          `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h3 style="color: #43a047;">You've been added to an event!</h3>
              <p>Hi ${user.firstname || user.email},</p>
              <p>You have been added as a participant to <strong>${
                event.title
              }</strong>.</p>
              <p>Event details:</p>
              <ul>
                <li><strong>Date:</strong> ${
                  event.date ? new Date(event.date).toLocaleString() : "N/A"
                }</li>
                <li><strong>Location:</strong> ${event.location || "N/A"}</li>
              </ul>
              <p>Event Description:</p>
              <p>${event.description || "No description provided."}</p>
              <p>Check your calendar for more details: </p>
              <p><a href="${event.link || "http://localhost:4200/calendar"}">Calendar Link</a></p>
              <p>If you have any questions, feel free to reach out.</p>
              <p>See you there!</p>
            </div>
          `
        );
      }
    }

    res.status(200).json({
      message: "Participants added successfully and notified by email",
      attendees: event.attendees,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding participants", error: error.message });
  }
};
