import passport from 'passport';
import passportJwtStrategy from '../lib/authentication/strategies/passport-jwt';
import UnauthenticatedError from "../lib/error/unauthenticated.error";
import UnauthorisedError from "../lib/error/unauthorised.error";
import { MESSAGES } from '../utils/messages';
import { Request, Response, NextFunction } from 'express';

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

const authentication = (options?: AuthOptions) => 
    (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(
            'jwt',
            {
                session: false,
            },
            (err: Error | null, user: User | false) => {
                if (err) {
                    console.log(err,"==err")
                    return next(err);
                }

                if (options && options.isGuest === false && user && user.isGuest) {
                    return next(new UnauthorisedError("Please Login first to continue"));
                }
                if (user) {
                    req.user = user;
                    return next();
                } else {
                    return next(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID));
                }
            }
        )(req, res, next);
    };

export default authentication;
