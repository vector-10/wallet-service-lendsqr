import jwt from "jsonwebtoken";
import { generateToken, verifyToken } from "../utils/token";

const TEST_SECRET = "test_secret_key_for_jest";

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

describe("token utils", () => {
  describe("generateToken", () => {
    it("should return a JWT string with three parts", () => {
      const token = generateToken({ id: 1, email: "test@test.com" });
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("should encode id and email in the payload", () => {
      const token = generateToken({ id: 42, email: "user@example.com" });
      const decoded = jwt.decode(token) as Record<string, unknown>;
      expect(decoded.id).toBe(42);
      expect(decoded.email).toBe("user@example.com");
    });
  });

  describe("verifyToken", () => {
    it("should return the AuthPayload for a valid token", () => {
      const token = generateToken({ id: 1, email: "test@test.com" });
      const result = verifyToken(token);
      expect(result.id).toBe(1);
      expect(result.email).toBe("test@test.com");
    });

    it("should throw for a tampered / invalid token string", () => {
      expect(() => verifyToken("not.a.valid.token")).toThrow();
    });

    it("should throw for an expired token", () => {
      const expired = jwt.sign(
        { id: 1, email: "test@test.com" },
        TEST_SECRET,
        { expiresIn: -1 },
      );
      expect(() => verifyToken(expired)).toThrow();
    });

    it("should throw 'Invalid token payload' when id and email are missing", () => {

      const badToken = jwt.sign({ role: "admin" }, TEST_SECRET);
      expect(() => verifyToken(badToken)).toThrow("Invalid token payload");
    });

    it("should throw 'Invalid token payload' when payload is a plain string", () => {
     
      const stringToken = jwt.sign("raw-string-payload", TEST_SECRET);
      expect(() => verifyToken(stringToken)).toThrow("Invalid token payload");
    });
  });
});
