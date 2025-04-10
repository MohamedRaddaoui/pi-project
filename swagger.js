const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event API",
      version: "1.0.0",
      description: "API documentation for managing events with authentication",
    },
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:5000/api",
        description: "Development Server",
      },
    ],
    components: {
      schemas: {
        Event: {
          type: "object",
          required: [
            "title",
            "date",
            "startTime",
            "endTime",
            "type",
            "createdBy",
          ],
          properties: {
            id: {
              type: "string",
              description: "Auto-generated ID of the event",
            },
            title: {
              type: "string",
              description: "Title of the event",
            },
            description: {
              type: "string",
              description: "Optional description of the event",
            },
            date: {
              type: "string",
              format: "date",
              description: "The event date (YYYY-MM-DD)",
            },
            startTime: {
              type: "string",
              format: "date-time",
              description:
                "Start time of the event (must be on or after event date)",
            },
            endTime: {
              type: "string",
              format: "date-time",
              description: "End time of the event (must be after start time)",
            },
            location: {
              type: "string",
              description: "Location of the event",
            },
            type: {
              type: "string",
              enum: ["Meeting", "Appointment", "Deadline", "Event"],
              description: "Type of event",
            },
            attendees: {
              type: "array",
              items: {
                type: "string",
                format: "uuid",
                description: "User IDs of attendees",
              },
            },
            createdBy: {
              type: "string",
              format: "uuid",
              description: "User ID of the event creator",
            },
            status: {
              type: "string",
              enum: ["Scheduled", "Completed", "Cancelled"],
              description: "Current status of the event",
            },
            cancellationReason: {
              type: "string",
              description: "Reason for cancellation (if applicable)",
            },
            reminder: {
              type: "string",
              format: "date-time",
              description: "Reminder notification time (if set)",
            },
            visibility: {
              type: "string",
              enum: ["Public", "Private"],
              default: "Private",
              description: "Visibility of the event",
            },
            repeat: {
              type: "string",
              enum: ["None", "Daily", "Weekly", "Monthly"],
              default: "None",
              description: "Recurrence of the event",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the event was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the event was last updated",
            },
          },
          example: {
            id: "60d21b4667d0d8992e610c85",
            title: "Tech Conference 2025",
            description: "An annual technology conference",
            date: "2025-06-15",
            startTime: "2025-06-15T10:00:00Z",
            endTime: "2025-06-15T16:00:00Z",
            location: "San Francisco, CA",
            type: "Meeting",
            attendees: ["60d21b4667d0d8992e610c88", "60d21b4667d0d8992e610c89"],
            createdBy: "60d21b4667d0d8992e610c87",
            status: "Scheduled",
            visibility: "Public",
            repeat: "None",
            createdAt: "2025-03-11T10:00:00Z",
            updatedAt: "2025-03-11T12:00:00Z",
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger Docs available at: http://localhost:5000/api/docs");
};

module.exports = setupSwagger;