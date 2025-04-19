const Event = require("../models/event"); // Import Event model
const User = require("../models/user"); // Import User model

const sendEmail = require("../../utils/sendEmail");

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
      createdBy: req.body.userID,
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
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

    if (event.attendees.includes(user._id)) {
      return res.status(400).json({ message: "User already participating" });
    }

    event.attendees.push(user._id);
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
    const { userId } = req.body;

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
