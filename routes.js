import Models from "./models";
import bcrypt from "bcrypt-nodejs";

const { User, Save, Person, File, Mail } = Models;

export const SignInUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user.email === "guest@guest.com") {
      return res.status(200).json({
        content: {
          id: user._id,
          email: email,
          accessToken: user.accessToken,
        },
        success: true,
      });
    }

    if (user && bcrypt.compareSync(password, user.password)) {
      return res.status(200).json({
        content: {
          id: user._id,
          email: email,
          accessToken: user.accessToken,
        },
        success: true,
      });
    } else {
      res.status(200).json({
        content: {},
        success: false,
      });
    }
  } catch (error) {
    res.status(200).json({ content: {}, success: false });
  }
};

export const SignUpUser = async (req, res) => {
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
      content: {
        id: newUser._id,
        accessToken: newUser.accessToken,
        email: newUser.email,
      },
      success: true,
    });
  } catch (error) {
    res.status(200).json({ content: {}, success: false });
  }
};

export const SaveGame = async (req, res) => {
  const {
    accessedFileList,
    mailList,
    triggeredEvents,
    accessedPersonList,
    userEmail,
  } = req.body;

  try {
    const saveObject = {
      accessedFileList: JSON.stringify(accessedFileList),
      mailList: JSON.stringify(mailList),
      triggeredEvents: JSON.stringify(triggeredEvents),
      accessedPersonList: JSON.stringify(accessedPersonList),
      userEmail,
    };
    const save = await Save.findOne({ userEmail });

    if (save) {
      await Save.updateOne({ userEmail }, saveObject);
    } else {
      const newSave = new Save(saveObject);

      await newSave.save();
    }

    res.status(201).json({
      content: {},
      success: true,
    });
  } catch (error) {
    res.status(200).json({ content: {}, success: false });
  }
};

export const LoadGame = async (req, res) => {
  const { userEmail } = req.body;
  const save = await Models.Save.findOne({ userEmail });

  if (save) {
    const saveObject = {
      accessedFileList: JSON.parse(save.accessedFileList),
      mailList: JSON.parse(save.mailList),
      triggeredEvents: JSON.parse(save.triggeredEvents),
      accessedPersonList: JSON.parse(save.accessedPersonList),
      userEmail,
    };

    res.status(200).json({ content: saveObject, success: true });
  } else {
    res.status(200).json({ content: {}, success: false });
  }
};

export const GetPersons = async (req, res) => {
  try {
    const persons = await Models.Person.find();
    res.status(200).json({ content: persons, success: true });
  } catch (error) {
    res.status(200).json({ content: {}, success: false });
  }
};

export const GetMails = async (req, res) => {
  try {
    const mails = await Models.Mail.find();
    res.status(200).json({ content: mails, success: true });
  } catch (error) {
    res.status(200).json({ content: {}, success: false });
  }
};

export const GetFiles = async (req, res) => {
  try {
    const files = await Models.File.find();
    res.status(200).json({ content: files, success: true });
  } catch (error) {
    res.status(200).json({ content: {}, success: false });
  }
};
