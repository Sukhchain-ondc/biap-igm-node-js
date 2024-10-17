import { Response, NextFunction } from "express";
import validateToken from "../lib/firebase/validateToken";

const authentication = () => (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const idToken = authHeader.split(" ")[1];
    validateToken(idToken).then((decodedToken) => {
      if (decodedToken) {
        req.user = { decodedToken: decodedToken, token: idToken };
        next();
      } else {
        res.status(401).send({
          status: 401,
          name: "UNAUTHENTICATED_ERROR",
          message: "Unauthenticated",
        });
      }
    });
  } else {
    next(
      res.status(401).send({
        status: 401,
        name: "UNAUTHENTICATED_ERROR",
        message: "Authorization header not provided",
      })
    );
  }
};

export default authentication;