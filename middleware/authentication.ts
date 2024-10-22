import passport from "passport";
import passportJwtStrategy from "../lib/authentication/strategies/passport-jwt";
import UnauthenticatedError from "../lib/error/unauthenticated.error";
import UnauthorisedError from "../lib/error/unauthorised.error";
import { MESSAGES } from "../utils/messages";
import { Request, Response, NextFunction } from "express";
import { logger } from "../shared/logger";
import IssueModel from "../database/issue.model";

passport.use(passportJwtStrategy);

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

interface AuthOptions {
  isGuest?: boolean;
}

interface User {
  isGuest: boolean;
  [key: string]: any;
}

const authentication =
  (options?: AuthOptions) =>
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "jwt",
      {
        session: false,
      },
      (err: Error | null, user: User | false) => {
        if (err) {
          console.log(err, "==err");
          return next(err);
        }

        if (options && options.isGuest === false && user && user.isGuest) {
          return next(new UnauthorisedError("Please Login first to continue"));
        }
        if (user) {
          req.user = user;
          return next();
        } else {
          return next(
            new UnauthenticatedError(
              MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID
            )
          );
        }
      }
    )(req, res, next);
  };

export const checkIfIssueAlreadyExist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const trxId = req.body.context.transaction_id;
    const subCatg = req.body.message.issue.sub_category;
    const issues: any[] = await IssueModel.find({
      transaction_id: trxId,
      sub_category: subCatg,
    });

    if (issues.length > 0) {
      res.status(400).json({
        status: 400,
        name: "BAD_REQUEST",
        message: "Issue already exists with this sub category",
      });
    }
    next();
  } catch (error) {
    logger.error("Error checking if issue exists:", error);
    res.status(500).json({
      status: 500,
      name: "INTERNAL_SERVER_ERROR",
      message: "An error occurred while checking for existing issues",
    });
  }
};

export default authentication;
