import express from "express";
import passport from "passport";
import passportLocal from "passport-local";
import User from "../model/User";

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
// userRouter.post(
//   "/register",
//   async (req: express.Request, res: express.Response) => {
//     User.register(
//       new User({
//         username: req.body.name,
//         email: req.body.email,
//         password: req.body.password,
//       }),
//       req.body.password,
//       function (err: any, user: any) {
//         if (err) {
//           console.error(err);
//           return res.render("register");
//         } else {
//           passport.authenticate("local")(req, res, function () {
//             res.redirect("/dashboard");
//           });
//         }
//       }
//     );
//   }
// );

export default userRouter;
