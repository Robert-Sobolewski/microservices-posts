import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import passport from "passport";
import * as dotenv from "dotenv";
import passportLocal from "passport-local";
import session from "express-session";
import User from "./model/User";
import userRouter from "./routes/User";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
dotenv.config();

const PORT = process.env.PORT || null;
const DB_URL = process.env.DB_URL || null;
const SECRET_KEY = process.env.SECRET_KEY || null;
const EXPIRATION_TIME = process.env.EXPIRATION_TIME || null;

if (!PORT) throw new Error("Port must be specified!!");
if (!DB_URL) throw new Error("DB_URL must be specified!!");
if (!SECRET_KEY) throw new Error("SECRET_KEY must be specified!!");
if (!EXPIRATION_TIME) throw new Error("EXPIRATION_TIME must be specified!!");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(
  //   passport.session()
  session({
    secret: SECRET_KEY,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static("public"));

/**
 * connect to db
 */
mongoose.connect(DB_URL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("connected to db successyfully"));
/**
 * routing
 */
app.get("/", (req: express.Request, res: express.Response) => {
  res.status(200).send("Hello World");
});

app.use("/api", userRouter);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
