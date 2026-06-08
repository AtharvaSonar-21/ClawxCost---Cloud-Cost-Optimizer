import { errorResponse } from '../utils/response.js';

export function requireAdmin(req, res, next) {
  const requestId = req.requestId;
  const userRole = req.user?.role;

  if (userRole !== 'admin') {
    return res
      .status(403)
      .json(errorResponse('Admin access required', 403, requestId));
  }

  next();
}

export default {
  requireAdmin,
};
