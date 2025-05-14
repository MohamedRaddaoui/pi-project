const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event and Q&A API",
      version: "1.0.0",
      description: "API documentation for managing events, Q&A, and comments with authentication",
    },
    servers: [
      {
        url: "{baseUrl}",
        description: "Development Server",
        variables: {
          baseUrl: {
            default: "/api",
            description: "Base URL for the API",
          },
        },
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
       // Question schema
       Question: {
         type: "object",
         required: ["title", "content", "author"],
         properties: {
           id: {
             type: "string",
             description: "Auto-generated ID of the question"
           },
           title: {
             type: "string",
             description: "The title of the question"
           },
           content: {
             type: "string",
             description: "The content/body of the question"
           },
           author: {
             type: "string",
             description: "User ID of the author"
           },
           tags: {
             type: "array",
             items: {
               type: "string"
             }
           },
           upvotes: {
             type: "array",
             items: {
               type: "string"
             }
           },
           downvotes: {
             type: "array",
             items: {
               type: "string"
             }
           },
           voteScore: {
             type: "number",
             default: 0
           },
           views: {
             type: "number",
             default: 0
           },
           createdAt: {
             type: "string",
             format: "date-time"
           },
           updatedAt: {
             type: "string",
             format: "date-time"
           }
         },
         example: {
           id: "60d21b4667d0d8992e610c95",
           title: "How to implement JWT authentication in Node.js?",
           content: "I'm trying to implement JWT authentication in my Node.js application...",
           author: "60d21b4667d0d8992e610c87",
           tags: ["nodejs", "jwt", "authentication"],
           upvotes: ["60d21b4667d0d8992e610c88"],
           downvotes: [],
           voteScore: 1,
           views: 42,
           createdAt: "2025-03-11T10:00:00Z",
           updatedAt: "2025-03-11T12:00:00Z"
         }
       },
       // Answer schema
       Answer: {
         type: "object",
         required: ["content", "author", "questionId"],
         properties: {
           id: {
             type: "string",
             description: "Auto-generated ID of the answer"
           },
           content: {
             type: "string",
             description: "The content of the answer"
           },
           author: {
             type: "string",
             description: "User ID of the author"
           },
           questionId: {
             type: "string",
             description: "ID of the question being answered"
           },
           isAccepted: {
             type: "boolean",
             default: false
           },
           upvotes: {
             type: "array",
             items: {
               type: "string"
             }
           },
           downvotes: {
             type: "array",
             items: {
               type: "string"
             }
           },
           voteScore: {
             type: "number",
             default: 0
           },
           createdAt: {
             type: "string",
             format: "date-time"
           },
           updatedAt: {
             type: "string",
             format: "date-time"
           }
         },
         example: {
           id: "60d21b4667d0d8992e610c96",
           content: "To implement JWT authentication in Node.js, you need to...",
           author: "60d21b4667d0d8992e610c88",
           questionId: "60d21b4667d0d8992e610c95",
           isAccepted: true,
           upvotes: ["60d21b4667d0d8992e610c87"],
           downvotes: [],
           voteScore: 1,
           createdAt: "2025-03-11T11:00:00Z",
           updatedAt: "2025-03-11T11:00:00Z"
         }
       },
       // SearchResponse schema
       SearchResponse: {
         type: "object",
         properties: {
           success: {
             type: "boolean",
             description: "Whether the search operation was successful"
           },
           count: {
             type: "integer",
             description: "Number of results found"
           },
           data: {
             type: "array",
             items: {
               $ref: "#/components/schemas/Question"
             }
           }
         },
         example: {
           success: true,
           count: 2,
           data: [
             {
               id: "60d21b4667d0d8992e610c95",
               title: "How to implement JWT authentication in Node.js?",
               content: "I'm trying to implement JWT authentication in my Node.js application...",
               author: "60d21b4667d0d8992e610c87",
               tags: ["nodejs", "jwt", "authentication"],
               upvotes: ["60d21b4667d0d8992e610c88"],
               downvotes: [],
               voteScore: 1,
               views: 42,
               createdAt: "2025-03-11T10:00:00Z",
               updatedAt: "2025-03-11T12:00:00Z"
             }
           ]
         }
       },
       // AdvancedSearchQuery schema
       AdvancedSearchQuery: {
         type: "object",
         properties: {
           query: {
             type: "string",
             description: "Text to search for in titles and content"
           },
           tags: {
             type: "string",
             description: "Comma-separated list of tags to filter by"
           },
           author: {
             type: "string",
             description: "Author ID to filter by"
           },
           startDate: {
             type: "string",
             format: "date",
             description: "Start date for date range filter (ISO 8601)"
           },
           endDate: {
             type: "string",
             format: "date",
             description: "End date for date range filter (ISO 8601)"
           }
         }
       },
       // SentimentAnalysis schema
       SentimentAnalysis: {
         type: "object",
         properties: {
           score: {
             type: "number",
             description: "Overall sentiment score (negative numbers for negative sentiment, positive for positive sentiment)"
           },
           comparative: {
             type: "number",
             description: "Normalized sentiment score"
           },
           tokens: {
             type: "array",
             items: {
               type: "string"
             },
             description: "Words that contributed to the sentiment"
           },
           positive: {
             type: "array",
             items: {
               type: "string"
             },
             description: "Words identified as positive"
           },
           negative: {
             type: "array",
             items: {
               type: "string"
             },
             description: "Words identified as negative"
           }
         },
         example: {
           score: 2,
           comparative: 0.5,
           tokens: ["great", "solution", "works", "perfectly"],
           positive: ["great", "perfectly"],
           negative: []
         }
       },
       // SentimentResponse schema
       SentimentResponse: {
         type: "object",
         properties: {
           success: {
             type: "boolean",
             description: "Whether the operation was successful"
           },
           sentiment: {
             $ref: "#/components/schemas/SentimentAnalysis"
           }
         },
         example: {
           success: true,
           sentiment: {
             score: 2,
             comparative: 0.5,
             tokens: ["great", "solution", "works", "perfectly"],
             positive: ["great", "perfectly"],
             negative: []
           }
         }
       },
       // FrequentQuestion schema
       FrequentQuestion: {
         type: "object",
         properties: {
           title: {
             type: "string",
             description: "Question title"
           },
           content: {
             type: "string",
             description: "Question content"
           },
           frequency: {
             type: "integer",
             description: "How many times similar questions have been asked"
           },
           sentiment: {
             $ref: "#/components/schemas/SentimentAnalysis"
           },
           views: {
             type: "integer",
             description: "Number of times the question has been viewed"
           },
           voteScore: {
             type: "integer",
             description: "Net vote score (upvotes - downvotes)"
           }
         },
         example: {
           title: "How to implement authentication?",
           content: "I need help with user authentication...",
           frequency: 5,
           sentiment: {
             score: 0,
             comparative: 0,
             tokens: ["help", "authentication"],
             positive: [],
             negative: []
           },
           views: 120,
           voteScore: 10
         }
       },
       // FrequentQuestionsResponse schema
       FrequentQuestionsResponse: {
         type: "object",
         properties: {
           success: {
             type: "boolean",
             description: "Whether the operation was successful"
           },
           questions: {
             type: "array",
             items: {
               $ref: "#/components/schemas/FrequentQuestion"
             }
           }
         },
         example: {
           success: true,
           questions: [
             {
               title: "How to implement authentication?",
               content: "I need help with user authentication...",
               frequency: 5,
               sentiment: {
                 score: 0,
                 comparative: 0,
                 tokens: ["help", "authentication"],
                 positive: [],
                 negative: []
               },
               views: 120,
               voteScore: 10
             }
           ]
         }
       },
       // GoogleSheetsDashboardResponse schema
       GoogleSheetsDashboardResponse: {
         type: "object",
         properties: {
           success: {
             type: "boolean",
             description: "Whether the operation was successful"
           },
           message: {
             type: "string",
             description: "Status message"
           },
           updatedQuestions: {
             type: "integer",
             description: "Number of questions updated in the sheet"
           }
         },
         example: {
           success: true,
           message: "Google Sheets dashboard updated successfully",
           updatedQuestions: 100
         }
       }
      },
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./src/routes/*.js", "./src/routes/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  if (process.env.NODE_ENV !== "test") {
    // Only log in non-test environments
    app.get("/api/docs", (req, res, next) => {
      req.logger?.info("Swagger documentation accessed");
      next();
    });
  }
};

module.exports = setupSwagger;
