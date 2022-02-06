import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import personData from "./data/persons.json";
import filesData from "./data/files.json";
import MailsData from "./data/mails.json";
import Models from "./models";
import listEndpoints from "express-list-endpoints";
import {
  SignInUser,
  SignUpUser,
  SaveGame,
  LoadGame,
  GetPersons,
  GetFiles,
  GetMails,
} from "./routes";

const { Person, File, Mail, User } = Models;

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/murdermystery";
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => console.log("Connected to DB"))
  .catch((err) => console.log("Something went wrong!", err));
mongoose.Promise = Promise;

if (process.env.RESET_DATABASE) {
  const seedDatabase = async () => {
    console.log("Seeding database");
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
}

const authenticateUser = async (req, res, next) => {
  const accessToken = req.header("Authorization");
  try {
    const user = await User.findOne({ accessToken });

    if (user) {
      next();
    } else {
      res.status(404).json({ content: {}, success: false });
    }
  } catch (error) {
    res.status(400).json({ content: {}, success: false });
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

app.use(cors());
app.use(bodyParser.json());
app.use("/media", express.static("public"));

// ----------------Routes------------------

app.get("/", (req, res) => {
  res.send(listEndpoints(app));
});

app.post("/", SignInUser);

app.post("/signup", SignUpUser);

app.post("/save", authenticateUser);
app.post("/save", SaveGame);

app.post("/load", authenticateUser);
app.post("/load", LoadGame);

app.get("/files", authenticateUser);
app.get("/files", GetFiles);

app.get("/mails", authenticateUser);
app.get("/mails", GetMails);

app.get("/persons", authenticateUser);
app.get("/persons", GetPersons);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
