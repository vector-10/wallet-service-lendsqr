import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../middlewares/errorHandler";
import { AppError, NotFoundError } from "../utils/errors";

const makeRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = {} as Request;
const mockNext = jest.fn() as unknown as NextFunction;

describe("errorHandler middleware", () => {
  it("should use AppError.statusCode when error is an AppError", () => {
    const res = makeRes();
    errorHandler(new AppError("Custom error", 422), mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: false, message: "Custom error" }),
    );
  });

  it("should use subclass statusCode (NotFoundError → 404)", () => {
    const res = makeRes();
    errorHandler(new NotFoundError("Resource not found"), mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Resource not found" }),
    );
  });

  it("should default to 500 for a plain Error", () => {
    const res = makeRes();
    errorHandler(new Error("Unexpected failure"), mockReq, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: false, message: "Unexpected failure" }),
    );
  });
});
