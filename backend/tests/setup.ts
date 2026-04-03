process.env.NODE_ENV = 'test';
process.env.PORT = '4001';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/finance_test?schema=public';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_123456789';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_123456789';
process.env.ACCESS_TOKEN_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS = '7';
process.env.CORS_ORIGIN = 'http://localhost:5173';
