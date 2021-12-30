import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import personData from "./data/persons.json";
import filesData from "./data/files.json";
import MailsData from "./data/mails.json";

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

const port = process.env.PORT || 8080;
const app = express();

const Person = mongoose.model("Person", {
  id: Number,
  firstName: String,
  lastName: String,
});

const File = mongoose.model("File", {
  id: Number,
  fileId: String,
  name: String,
});

const Mail = mongoose.model("Mail", {
  id: Number,
  subject: String,
  text: String,
  from: String,
  unread: Boolean,
  timeStamp: Date,
});

if (process.env.RESET_DATABASE) {
  const seedDatabase = async () => {
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

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

// Start defining your routes here
app.get("/persons", async (req, res) => {
  const persons = await Person.find();
  res.json(persons);
});

app.get("/files", async (req, res) => {
  const files = await File.find();
  res.json(files);
});

app.get("/mails", async (req, res) => {
  const mails = await Mail.find();
  res.json(mails);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
