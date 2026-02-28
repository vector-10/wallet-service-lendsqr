import adjutorService from "../services/adjutor.service";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("AdjutorService", () => {
  describe("checkKarmaBlacklist", () => {
    it("should return false when user is not blacklisted (404)", async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 404 } });

      const result = await adjutorService.checkKarmaBlacklist("22345678901");
      expect(result).toBe(false);
    });

    it("should return false when response is a mock response (test mode)", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          "mock-response": "This is a mock response",
          data: { karma_identity: "test" },
        },
      });

      const result = await adjutorService.checkKarmaBlacklist("22345678901");
      expect(result).toBe(false);
    });

    it("should return true when user is blacklisted", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: { karma_identity: "22345678901" },
        },
      });

      const result = await adjutorService.checkKarmaBlacklist("22345678901");
      expect(result).toBe(true);
    });

    it("should throw error when API call fails", async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 500 },
      });

      await expect(
        adjutorService.checkKarmaBlacklist("22345678901"),
      ).rejects.toThrow(
        "Identity verification failed. Please try again later or contact support.",
      );
    });
  });
});
