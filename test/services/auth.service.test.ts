import {
  createUser,
  getUser,
  login,
  resetPassword,
} from "../../src/services/auth.service";

// Mock the supabase module
jest.mock("../../src/config/supabase", () => ({
  supabase: {
    auth: {
      admin: {
        createUser: jest.fn(),
      },
      signInWithPassword: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

// Import the mocked module
import { supabase } from "../../src/config/supabase";

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should call Supabase createUser with correct parameters", async () => {
      const mockResponse = { data: { user: { id: "123" } }, error: null };
      (supabase.auth.admin.createUser as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const email = "test@example.com";
      const password = "password123";
      const metadata = { role: "user" };

      const result = await createUser(email, password, metadata);

      expect(supabase.auth.admin.createUser).toHaveBeenCalledWith({
        email,
        password,
        app_metadata: {
          ...metadata,
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("login", () => {
    it("should call Supabase signInWithPassword with correct parameters", async () => {
      const mockResponse = {
        data: {
          session: { token: "abc123" },
          user: { id: "123" },
        },
        error: null,
      };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const email = "test@example.com";
      const password = "password123";

      const result = await login(email, password);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("resetPassword", () => {
    it("should call Supabase resetPasswordForEmail with correct parameters", async () => {
      const mockResponse = { data: {}, error: null };
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      process.env.PASSWORD_RESET_REDIRECT_URL = "https://example.com/reset";
      const email = "test@example.com";

      const result = await resetPassword(email);

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email, {
        redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getUser", () => {
    it("should call Supabase getUser with correct token", async () => {
      const mockResponse = { data: { user: { id: "123" } }, error: null };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue(mockResponse);

      const token = "abc123";

      const result = await getUser(token);

      expect(supabase.auth.getUser).toHaveBeenCalledWith(token);
      expect(result).toEqual(mockResponse);
    });
  });
});
