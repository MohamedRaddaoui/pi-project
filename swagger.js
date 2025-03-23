const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event and Forum API",
      version: "1.0.0",
      description: "API documentation for managing events and forum comments with authentication",
    },
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:5000/api",
        description: "Development Server",
      },
    ],
    components: {
      schemas: {
        // Event schema
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
        // Forum schema
        Forum: {
          type: "object",
          required: ["title", "description", "createdBy", "createdAt"],
          properties: {
            id: {
              type: "string",
              description: "Auto-generated ID of the forum",
            },
            title: {
              type: "string",
              description: "Title of the forum",
            },
            description: {
              type: "string",
              description: "Description of the forum",
            },
            createdBy: {
              type: "string",
              format: "uuid",
              description: "User ID of the creator of the forum",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the forum was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the forum was last updated",
            },
          },
          example: {
            id: "60d21b4667d0d8992e610c90",
            title: "Project Feedback",
            description: "A forum for discussing project-related feedback.",
            createdBy: "60d21b4667d0d8992e610c88",
            createdAt: "2025-03-15T10:00:00Z",
            updatedAt: "2025-03-15T12:00:00Z",
          },
        },
        // Comment schema
        Comment: {
          type: "object",
          required: ["user", "text", "forumId", "createdAt"],
          properties: {
            id: {
              type: "string",
              description: "Auto-generated ID of the comment",
            },
            user: {
              type: "string",
              description: "User ID who made the comment",
            },
            text: {
              type: "string",
              description: "The content of the comment",
            },
            forumId: {
              type: "string",
              description: "ID of the forum to which the comment belongs",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the comment was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the comment was last updated",
            },
          },
          example: {
            id: "60d21b4667d0d8992e610c91",
            user: "60d21b4667d0d8992e610c89",
            text: "This is a comment on the forum topic.",
            forumId: "60d21b4667d0d8992e610c90",
            createdAt: "2025-03-15T10:15:00Z",
            updatedAt: "2025-03-15T10:15:00Z",
          },
        },
        // Reply schema
        Reply: {
          type: "object",
          required: ["user", "text", "createdAt"],
          properties: {
            id: {
              type: "string",
              description: "Auto-generated ID of the reply",
            },
            user: {
              type: "string",
              description: "User ID who made the reply",
            },
            text: {
              type: "string",
              description: "The content of the reply",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the reply was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the reply was last updated",
            },
          },
          example: {
            id: "60d21b4667d0d8992e610c92",
            user: "60d21b4667d0d8992e610c89",
            text: "This is a reply to the comment.",
            createdAt: "2025-03-15T10:30:00Z",
            updatedAt: "2025-03-15T10:30:00Z",
          },
        },
        //Task schema
        Task: {
          type: "object",
          required: ["title", "projectId"],
          properties: {
            _id: {
              type: "string",
              description: "Auto-generated ID of the task",
            },
            title: {
              type: "string",
              description: "Task title",
            },
            description: {
              type: "string",
              description: "Task details",
            },
            status: {
              type: "string",
              enum: ["To Do", "In Progress", "Done"],
              default: "To Do",
            },
            priority: {
              type: "string",
              enum: ["Low", "Medium", "High"],
              default: "Medium",
            },
            dueDate: {
              type: "string",
              format: "date",
              description: "Due date of the task",
            },
            projectId: {
              type: "string",
              description: "Project ID the task belongs to",
            },
            assignedUser: {
              type: "string",
              description: "ID of the assigned user",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
          example:{
             _id: "60d21b4667d0d8992e610c95",
             title: "Updated Task Title",
             description: "This task has been updated with new details.",
             status: "In Progress",
             priority: "Medium",
             dueDate: "2025-03-22",
             projectId: "65f123456789abcdef123456",
             assignedUser: "65fabcdef123456789abcdef",
             createdAt: "2025-03-11T10:00:00Z",
	           updatedAt: "2025-03-15T12:00:00Z"
	         }
        },
      // TaskCreate schema (for creating tasks)
        TaskCreate: {
        type: "object",
        required: ["title", "projectId"],
        properties: {
          title: {
            type: "string",
            description: "Task title"
          },
          description: {
            type: "string",
            description: "Task details"
          },
          status: {
            type: "string",
            enum: ["To Do", "In Progress", "Done"],
            default: "To Do"
          },
          priority: {
            type: "string",
            enum: ["Low", "Medium", "High"],
            default: "Medium"
          },
          dueDate: {
            type: "string",
            format: "date",
            description: "Due date of the task"
          },
          projectId: {
            type: "string",
            description: "Project ID the task belongs to"
          },
          assignedUser: {
            type: "string",
            description: "ID of the assigned user"
          }
        },
        example: {
          title: "New Task",
          description: "This is a test task",
          status: "To Do",
          priority: "High",
          dueDate: "2025-03-20",
          projectId: "65f123456789abcdef123456",
          assignedUser: "65fabcdef123456789abcdef"
        }
       },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"], // Ensure this path matches your routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger Docs available at: http://localhost:5000/api/docs");
};

module.exports = setupSwagger;
