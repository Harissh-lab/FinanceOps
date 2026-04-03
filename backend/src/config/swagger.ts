import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const ErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

const SuccessSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  meta: z
    .object({
      page: z.number().optional(),
      total: z.number().optional(),
      limit: z.number().optional(),
    })
    .optional(),
});

registry.register('ErrorResponse', ErrorSchema);
registry.register('SuccessResponse', SuccessSchema);

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({ email: z.string().email(), password: z.string() }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: SuccessSchema,
        },
      },
    },
    401: {
      description: 'Invalid credentials',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Finance Data Processing API',
      version: '1.0.0',
      description: 'Production-ready backend for finance records, analytics, and access control',
    },
    servers: [{ url: 'http://localhost:4000' }],
    tags: [
      { name: 'Auth' },
      { name: 'Users' },
      { name: 'Records' },
      { name: 'Dashboard' },
    ],
  });
}
