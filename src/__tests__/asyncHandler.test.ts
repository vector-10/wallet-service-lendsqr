import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

const makeRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = {} as Request;
const mockNext = jest.fn() as unknown as NextFunction;

describe("asyncHandler", () => {
  it("should call the wrapped function normally", async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const res = makeRes();
    await asyncHandler(fn)(mockReq, res, mockNext);
    expect(fn).toHaveBeenCalledWith(mockReq, res, mockNext);
  });

  it("should send AppError statusCode when an AppError is thrown", async () => {
    const fn = jest.fn().mockRejectedValue(new AppError("Unprocessable", 422));
    const res = makeRes();
    await asyncHandler(fn)(mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: false, message: "Unprocessable" }),
    );
  });

  it("should default to 400 when a plain Error is thrown", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("Something broke"));
    const res = makeRes();
    await asyncHandler(fn)(mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Something broke" }),
    );
  });

  it("should use fallback message when a non-Error value is thrown", async () => {
    // Someone throws a plain string — not an Error instance
    const fn = jest.fn().mockRejectedValue("a plain string");
    const res = makeRes();
    await asyncHandler(fn)(mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "An unexpected error occurred" }),
    );
  });
});
