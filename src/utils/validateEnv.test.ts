import { validateEnv } from "./validateEnv";

describe("validateEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should not throw an error when all required environment variables are present", () => {
    // Set all required environment variables
    process.env.PORT = "3000";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "some-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "some-service-role-key";
    process.env.SUPABASE_JWT_SECRET = "some-jwt-secret";

    // Expect validateEnv not to throw
    expect(() => validateEnv()).not.toThrow();
  });

  it("should throw an error when a required environment variable is missing", () => {
    // Set all environment variables except PORT
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "some-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "some-service-role-key";
    process.env.SUPABASE_JWT_SECRET = "some-jwt-secret";
    // Deliberately not setting PORT

    // Expect validateEnv to throw with a specific error message
    expect(() => validateEnv()).toThrow(
      "Missing required environment variables: PORT",
    );
  });

  it("should throw an error with all missing environment variables listed", () => {
    // Don't set any of the required environment variables
    delete process.env.PORT;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_JWT_SECRET;

    // Expect validateEnv to throw with all missing variables in the error message
    expect(() => validateEnv()).toThrow(
      "Missing required environment variables: PORT, SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET",
    );
  });
});
