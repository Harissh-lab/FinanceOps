const errorResponses = {
  400: {
    description: 'Bad request',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
          },
        },
      },
    },
  },
  401: {
    description: 'Unauthorized',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication token is missing',
          },
        },
      },
    },
  },
  403: {
    description: 'Forbidden',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to perform this action',
          },
        },
      },
    },
  },
  404: {
    description: 'Not found',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found',
          },
        },
      },
    },
  },
};

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'FinanceOps API',
    description:
      'Finance Data Processing and Access Control Backend — Role-based REST API with JWT authentication, financial records management, dashboard analytics, and investment projections.',
    version: '1.0.0',
    contact: {
      name: 'FinanceOps',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local development server',
    },
  ],
  tags: [{ name: 'Auth' }, { name: 'Users' }, { name: 'Records' }, { name: 'Dashboard' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Request validation failed' },
              details: { type: 'object', nullable: true },
            },
            required: ['code', 'message'],
          },
        },
        required: ['success', 'error'],
      },
      SuccessMessageResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Operation completed successfully' },
            },
            required: ['message'],
          },
        },
        required: ['success', 'data'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'email', 'role', 'status'],
      },
      FinancialRecord: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'number', format: 'float' },
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          category: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          notes: { type: 'string', nullable: true },
          isDeleted: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          creator: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
            },
          },
        },
        required: ['id', 'amount', 'type', 'category', 'date'],
      },
      DashboardSummary: {
        type: 'object',
        properties: {
          totalIncome: { type: 'number' },
          totalExpenses: { type: 'number' },
          netBalance: { type: 'number' },
          recordCount: { type: 'number' },
          trendWindow: {
            type: 'object',
            properties: {
              label: { type: 'string', example: 'last 30 days vs prior 30 days' },
              incomeChangePct: { type: 'number' },
              expenseChangePct: { type: 'number' },
              netBalanceChangePct: { type: 'number' },
              savingsRateChangePct: { type: 'number' },
            },
            required: [
              'label',
              'incomeChangePct',
              'expenseChangePct',
              'netBalanceChangePct',
              'savingsRateChangePct',
            ],
          },
        },
        required: ['totalIncome', 'totalExpenses', 'netBalance', 'recordCount'],
      },
      DashboardTrendPoint: {
        type: 'object',
        properties: {
          month: { type: 'string' },
          income: { type: 'number' },
          expense: { type: 'number' },
        },
        required: ['month', 'income', 'expense'],
      },
      DashboardCategoryPoint: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          income: { type: 'number' },
          expense: { type: 'number' },
          total: { type: 'number' },
        },
        required: ['category', 'income', 'expense', 'total'],
      },
      DashboardHealthScore: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          label: { type: 'string', enum: ['Poor', 'Fair', 'Good', 'Excellent'] },
          savingsRate: { type: 'number' },
          expenseRatio: { type: 'number' },
          recordCount: { type: 'number' },
          insights: { type: 'array', items: { type: 'string' } },
        },
        required: ['score', 'label', 'savingsRate', 'expenseRatio', 'recordCount', 'insights'],
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'number', example: 1 },
          limit: { type: 'number', example: 10 },
          total: { type: 'number', example: 25 },
        },
        required: ['page', 'limit', 'total'],
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new viewer account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
                required: ['name', 'email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
                example: {
                  success: true,
                  data: {
                    id: 'a8f4dc92-a738-4fbc-9f0d-d53e9db68eca',
                    name: 'John Doe',
                    email: 'john@finance.com',
                    role: 'VIEWER',
                    status: 'ACTIVE',
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate user and issue JWT tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
                example: {
                  success: true,
                  data: {
                    accessToken: 'jwt-access-token',
                    refreshToken: 'jwt-refresh-token',
                    user: {
                      id: 'a8f4dc92-a738-4fbc-9f0d-d53e9db68eca',
                      name: 'Admin User',
                      email: 'admin@finance.com',
                      role: 'ADMIN',
                      status: 'ACTIVE',
                    },
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token using refresh token',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                      },
                      required: ['accessToken'],
                    },
                  },
                },
                example: {
                  success: true,
                  data: { accessToken: 'new-jwt-access-token' },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout user and revoke refresh token',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessageResponse' },
                example: {
                  success: true,
                  data: { message: 'Logged out successfully' },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Initiate password reset flow',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                },
                required: ['email'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Reset flow initiated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessageResponse' },
                example: {
                  success: true,
                  data: { message: 'If an account exists, a reset email has been sent.' },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset account password with reset token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
                required: ['token', 'newPassword'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessageResponse' },
                example: {
                  success: true,
                  data: { message: 'Password has been reset successfully' },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users with search and pagination',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Users fetched successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
                example: {
                  success: true,
                  data: [
                    {
                      id: 'a8f4dc92-a738-4fbc-9f0d-d53e9db68eca',
                      name: 'Admin User',
                      email: 'admin@finance.com',
                      role: 'ADMIN',
                      status: 'ACTIVE',
                    },
                  ],
                  meta: { page: 1, limit: 10, total: 3 },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create a new user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  role: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
                },
                required: ['name', 'email', 'password', 'role'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
                example: {
                  success: true,
                  data: {
                    id: 'f6f2f056-68de-4ba4-a7f4-6785cf7fb696',
                    name: 'New Analyst',
                    email: 'analyst2@finance.com',
                    role: 'ANALYST',
                    status: 'ACTIVE',
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'User fetched successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update user role or status',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'User deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessageResponse' },
                example: {
                  success: true,
                  data: { message: 'User deleted successfully' },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/records': {
      get: {
        tags: ['Records'],
        summary: 'List financial records with filters and pagination',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Records fetched successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/FinancialRecord' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
                example: {
                  success: true,
                  data: [
                    {
                      id: '76cc5226-4f0f-4e17-850c-b4e3284c64a2',
                      amount: 3200,
                      type: 'INCOME',
                      category: 'Salary',
                      date: '2026-03-05T00:00:00.000Z',
                    },
                  ],
                  meta: { page: 1, limit: 10, total: 42 },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
      post: {
        tags: ['Records'],
        summary: 'Create a financial record',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'number' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                  category: { type: 'string' },
                  date: { type: 'string', format: 'date' },
                  notes: { type: 'string' },
                },
                required: ['amount', 'type', 'category', 'date'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Record created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/FinancialRecord' },
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/records/{id}': {
      get: {
        tags: ['Records'],
        summary: 'Get financial record by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Record fetched successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/FinancialRecord' },
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
      patch: {
        tags: ['Records'],
        summary: 'Update financial record by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'number' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                  category: { type: 'string' },
                  date: { type: 'string', format: 'date' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Record updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/FinancialRecord' },
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
      delete: {
        tags: ['Records'],
        summary: 'Delete financial record by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Record deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessageResponse' },
                example: {
                  success: true,
                  data: { message: 'Record deleted successfully' },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/records/import': {
      post: {
        tags: ['Records'],
        summary: 'Import records from uploaded file',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'allowReplaceExisting',
            in: 'query',
            schema: { type: 'boolean', default: false },
            description: 'When true, archives active records before import',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                  },
                },
                required: ['file'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Import completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        importedCount: { type: 'number' },
                        failedCount: { type: 'number' },
                        mode: { type: 'string', enum: ['replace', 'append'] },
                        errors: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              rowNumber: { type: 'number' },
                              reason: { type: 'string' },
                            },
                          },
                        },
                        message: { type: 'string' },
                      },
                    },
                  },
                },
                example: {
                  success: true,
                  data: {
                    importedCount: 120,
                    failedCount: 2,
                    mode: 'append',
                    errors: [{ rowNumber: 8, reason: 'Invalid amount' }],
                    message: 'Import completed with partial failures. Check errors for invalid rows.',
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard summary totals and rolling trend deltas',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Summary fetched successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/DashboardSummary' },
                  },
                },
                example: {
                  success: true,
                  data: {
                    totalIncome: 12850,
                    totalExpenses: 3750,
                    netBalance: 9100,
                    recordCount: 64,
                    trendWindow: {
                      label: 'last 30 days vs prior 30 days',
                      incomeChangePct: 12.4,
                      expenseChangePct: -3.8,
                      netBalanceChangePct: 18.2,
                      savingsRateChangePct: 4.7,
                    },
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/dashboard/trends': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get monthly income vs expense trend points',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Trend data fetched successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/DashboardTrendPoint' } },
                  },
                },
                example: {
                  success: true,
                  data: [
                    { month: 'Nov 2025', income: 3200, expense: 900 },
                    { month: 'Dec 2025', income: 3000, expense: 450 },
                  ],
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/dashboard/categories': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get category-wise totals for income and expenses',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Category breakdown fetched successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/DashboardCategoryPoint' } },
                  },
                },
                example: {
                  success: true,
                  data: [
                    { category: 'Salary', income: 9050, expense: 0, total: 9050 },
                    { category: 'Rent', income: 0, expense: 1800, total: 1800 },
                  ],
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/dashboard/recent': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get most recent financial transactions',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Recent transactions fetched successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/FinancialRecord' } },
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    '/api/dashboard/health-score': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get financial health score and explanatory insights',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Health score fetched successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/DashboardHealthScore' },
                  },
                },
                example: {
                  success: true,
                  data: {
                    score: 74,
                    label: 'Good',
                    savingsRate: 41.2,
                    expenseRatio: 58.8,
                    recordCount: 64,
                    insights: [
                      'Savings rate is 41.2% of income.',
                      'Expenses consume 58.8% of income.',
                      'Score confidence uses 64 active records.',
                      'Strong cushion: continue investing and keep fixed costs stable.',
                    ],
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
  },
} as const;

export const openapiSpec = swaggerSpec;

export function generateOpenApiDocument() {
  return swaggerSpec;
}
