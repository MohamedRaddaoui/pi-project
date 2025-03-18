const Event = require("../models/event"); // Import Event model

// 📌 Create an Event
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
