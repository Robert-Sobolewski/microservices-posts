import express from "express";
import passport from "passport";
import passportLocal from "passport-local";
import User from "../model/User";
import * as passwJwt from "passport-jwt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;
const EXPIRATION_TIME = process.env.EXPIRATION_TIME;
if (!SECRET_KEY) throw new Error(" SECRET_KEY must be specified!!");
if (!EXPIRATION_TIME) throw new Error(" EXPIRATION_TIME must be specified!!");
let JwtStrategy = passwJwt.Strategy;

/**
 * local strategy
 */
passport.use(
  new passportLocal.Strategy(function (
    username: string,
    password: string,
    done: any
  ) {
    User.findOne({ username: username }, function (err: any, user: any) {
      if (err) return done(err);
      if (!user) return done(null, false, { message: "Incorrect username." });
      if (!user.isCorrectPassword(password))
        return done(null, false, { message: "Incorrect password." });
      return done(null, user);
    });
  })
);

/**
 *  jwt strategy
 */
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: (req: express.Request) => req.cookies.token,
      secretOrKey: SECRET_KEY,
    },
    async (payload: any, done: any) => {
      try {
        const user = await User.findById(payload._id);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err: any) {
        done(err);
      }
    }
  )
);

const userRouter = express.Router();

/**
 * register new user
 */

userRouter.post(
  "/register",
  async (req: express.Request, res: express.Response) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !password || !email)
        return res.status(400).json({
          success: false,
          message: "Username, email or password not provided!",
          data: null,
        });
      //create new user with passportLocal mongoose
      const newUser = await User.register({ username, email }, password);
      req.login(newUser, (err: any) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: err.message, data: null });
        // delete newUser.password;
        return res.status(200).json({
          success: true,
          message: "User created and login successfully!",
          data: newUser,
        });
      });
    } catch (err: any) {
      return res
        .status(500)
        .json({ success: false, message: err.message, data: null });
    }
  }
);

/*
 * login user
 */
userRouter.post(
  "/login",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    passport.authenticate(
      "local",
      (err: any, user?: any, info?: { message: any }) => {
        if (err) return next(err);
        if (!user)
          return res
            .status(400)
            .json({ success: false, message: info?.message, data: null });

        // if user create token and set cookie
        const token = jwt.sign({ _id: user._id }, SECRET_KEY, {
          expiresIn: EXPIRATION_TIME,
        });
        res.cookie("token", token, { httpOnly: true });
        return res.status(200).json({
          success: true,
          message: info?.message,
          data: { _id: user._id, email: user.email },
        });
      }
    )(req, res, next);
  }
);

/**
 * logout
 */
userRouter.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  async (req: express.Request, res: express.Response) => {
    try {
      res.clearCookie("token");
      return res
        .status(200)
        .json({ success: true, message: "Logout Successful", data: null });
    } catch (err: any) {
      return res
        .status(500)
        .json({ success: false, message: err.message, data: null });
    }
  }
);

/**
 * isAuthenticated
 */
userRouter.get(
  "/isAuthenticated",
  passport.authenticate("jwt", { session: false }),
  (req: express.Request, res: express.Response) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }
      const decodedToken = jwt.verify(token, SECRET_KEY!);
      if (decodedToken) {
        return res.status(200).json({
          success: true,
          message: "User is authenticated",
          data: decodedToken,
        });
      }
    } catch (err: any) {
      return res
        .status(500)
        .json({ success: false, message: err.message, data: null });
    }
  }
);

export default userRouter;
