import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import personData from "./data/persons.json";
import filesData from "./data/files.json";
import MailsData from "./data/mails.json";
import bcrypt from "bcrypt-nodejs";

// Defines the port the app will run on. Defaults to 8080, but can be
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/murdermystery";
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => console.log("Connected to DB"))
  .catch((err) => console.log("Something went wrong!", err));
mongoose.Promise = Promise;

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: { type: String, required: true },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
  },
});

const User = mongoose.model("User", UserSchema);

const PersonSchema = new mongoose.Schema({
  socialSecurityNumber: String,
  firstName: String,
  lastName: String,
  image: String,
  info: String,
  dateOfBirth: String,
  placeOfBirth: String,
  height: String,
  eyes: String,
  hair: String,
  bloodType: String,
  triggersEvent: String,
});

const Person = mongoose.model("Person", PersonSchema);

const FileSchema = new mongoose.Schema({
  fileId: String,
  name: String,
});

const File = mongoose.model("File", FileSchema);

const MailSchema = new mongoose.Schema({
  subject: String,
  text: String,
  from: String,
  unread: Boolean,
  timeStamp: Date,
  image: String,
  event: String,
});

const Mail = mongoose.model("Mail", MailSchema);

// if (process.env.RESET_DATABASE) {
const seedDatabase = async () => {
  console.log("Seeding database");
  await User.deleteMany({});
  await Person.deleteMany({});
  await File.deleteMany({});
  await Mail.deleteMany({});

  personData.forEach(async (person) => {
    const newPerson = new Person(person);
    await newPerson.save();
  });

  filesData.forEach(async (file) => {
    const newFile = new File(file);
    await newFile.save();
  });

  MailsData.forEach(async (mail) => {
    const newMail = new Mail(mail);
    await newMail.save();
  });
};
seedDatabase();
// }

const authenticateUser = async (req, res, next) => {
  const accessToken = req.header("Authorization");
  try {
    const user = await User.findOne({ accessToken });

    if (user) {
      next();
    } else {
      res.status(404).json({ response: "Please, log in", success: false });
    }
  } catch (error) {
    res.status(400).json({ response: error, success: false });
  }
};

const initGuest = async () => {
  const guest = await User.findOne({ email: "guest@guest.com" });
  if (!guest) {
    const guest = new User({
      email: "guest@guest.com",
      password: "guest",
    });
    await guest.save();
  }
};

initGuest();

const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());
app.use("/media", express.static("public"));

// Start defining your routes here

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const salt = bcrypt.genSaltSync();

    if (password.length < 5) {
      throw "Password must be at least 5 characters long";
    }
    const newUser = new User({
      email: email.toLowerCase(),
      password: bcrypt.hashSync(password, salt),
    });

    await newUser.save();
    res.status(201).json({
      response: {
        id: newUser._id,
        accessToken: newUser.accessToken,
        email: newUser.email,
      },
      success: true,
    });
  } catch (error) {
    res.status(400).json({ response: error, success: false });
  }
});

app.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user.email === "guest@guest.com") {
      return res.status(200).json({
        response: {
          Id: user._id,
          email: email,
          accessToken: user.accessToken,
        },
        success: true,
      });
    }

    if (user && bcrypt.compareSync(password, user.password)) {
      return res.status(200).json({
        response: {
          Id: user._id,
          email: email,
          accessToken: user.accessToken,
        },
        success: true,
      });
    } else {
      res.status(404).json({
        response: "User email or password doesn't match",
        success: false,
      });
    }
  } catch (error) {
    res.status(404).json({ response: error, success: false });
  }
});

// app.get("/mails", authenticateUser);
app.get("/mails", async (req, res) => {
  const mails = await Mail.find();
  res.json(mails);
});

// app.get("/persons", authenticateUser);
app.get("/persons", async (req, res) => {
  const persons = await Person.find();
  res.json(persons);
});

// app.get("/files", authenticateUser);
app.get("/files", async (req, res) => {
  const files = await File.find();
  res.json(files);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
