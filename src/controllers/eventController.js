const Event = require("../models/event"); // Import Event model
const User = require("../models/user"); // Import User model
const { syncEvents } = require("../services/syncEvent");
const sendEmail = require("../../utils/sendEmail");
const {
  getAuthUrl,
  saveTokens,
  oauth2Client,
} = require("../config/googleAuth");
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
    const { userId } = req.user;

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
      await syncEvents(user);
      res.status(200).json({ message: "Events synced successfully" });
    }
  } catch (error) {
    console.error("Sync Error:", error);
    res
      .status(500)
      .json({ message: "An error occurred while syncing events." });
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
