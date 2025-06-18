// middleware/checkRole.js
import { StatusCodes } from "http-status-codes";

export const checkRole = (...roles) => {
  return async (req, res, next) => {
    const { role } = req.user;
    if (!roles.includes(role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        msg: "Bạn không có quyền truy cập",
      });
    }
    next();
  };
};
