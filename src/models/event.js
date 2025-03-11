const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true, // Improves query performance
    },
    startTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.date;
        },
        message: "Start time must be on or after the event date.",
      },
    },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: "End time must be after the start time.",
      },
    },
    location: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Meeting", "Appointment", "Deadline", "Event"],
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    reminder: {
      type: Date, // Optional field to store reminder notification time
    },
    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Private",
    },
    repeat: {
      type: String,
      enum: ["None", "Daily", "Weekly", "Monthly"],
      default: "None",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
