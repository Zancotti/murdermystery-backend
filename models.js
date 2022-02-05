import mongoose from "mongoose";
import crypto from "crypto";

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
  info: String,
  triggersEvent: String,
});

const File = mongoose.model("File", FileSchema);

const MailSchema = new mongoose.Schema({
  subject: String,
  text: String,
  from: String,
  unread: Boolean,
  timeStamp: Date,
  image: String,
  event: [{ type: String }],
});

const Mail = mongoose.model("Mail", MailSchema);

const SaveSchema = new mongoose.Schema({
  accessedFileList: String,
  mailList: String,
  triggeredEvents: String,
  accessedPersonList: String,
  userEmail: {
    type: String,
    unique: true,
  },
});

const Save = mongoose.model("Save", SaveSchema);

export default { User, File, Person, Mail, Save };
