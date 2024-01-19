const express = require("express");
const fs = require("fs/promises");
const jwt = require('jsonwebtoken');
var cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const multer = require("multer");
const User = require("./UserModal");
const dotenv = require("dotenv");
const path = require("path");
const authenticateToken = require("./JWTAuth");
dotenv.config();

const port = process.env.PORT || 5000;
const Database = process.env.DATABASE_KEY;

mongoose.connect(`${Database}`).then(() => {
  console.log("Conected to Database successfully");
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function createAdminUser() {
  try {
    const adminUser = await User.findOne({ userID: "5000" });

    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash("Webyapar", salt);
      const imgPath = path.resolve(__dirname, "default-user.webp");
      const profilePicBuffer = await fs.readFile(imgPath);
      const admin = new User({
        userID: "5000",
        password: hashPassword,
        role: "admin",
        profilePic: profilePicBuffer,
        name: "Admin",
      });

      await admin.save();
      console.log("Admin user created successfully.");
    } else {
      console.log("Admin account ready");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}
app.use(cors());

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/login", async (req, res) => {
  const { userID, password } = req.body;

  if(!userID || !password) {
    res.status(400).send({error:"Required values not given"})
  }
  try {
    // Find the user by userID
    const user = await User.findOne({ userID });

    if (!user) {
      return res.status(401).json({ error: "No user found" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check the user's role and respond accordingly
    const token = jwt.sign(
      { userID: user.userID, role: user.role, name: user.name },
      `${process.env.JWT_KEY}`);
    if (user.role === "admin" && user.userID === "5000") {
     
      return res.status(200).json({ message: "Hello admin", role:"admin", token });
    } else {
      const sendData = {
        message: `Hello ${user.name}`,
        role:"user",
        token,
      };
      return res.status(200).json(sendData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/userInfo", authenticateToken, async (req, res) => {
    const { role, userID } = req;
  
    try {
      // Retrieve all users from the database
      const user = await User.findOne({ userID }).select({userID:1, name:1, profilePic:1, status:1, updated:1});
  
      // Map user information to a simplified format
      const sendData = {
        userId: user.userID,
        name: user.name,
        profilePic: user.profilePic.toString("base64"),
        status: user.status,
        updated: user.updated
      }
  
      res.status(200).json(sendData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


app.get("/Adminusers", authenticateToken, async (req, res) => {
    const { role, userID } = req;
  
    if (!userID || role !== "admin") {
      res.status(401).send({ error: "You are not authorized" });
      return;
    }
    try {
      // Retrieve all users from the database
      const users = await User.find({ role: { $ne: "admin" } }).limit(2).select({userID:1, name:1});
  
      // Map user information to a simplified format
  
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


app.post("/create",authenticateToken, async (req, res) => {
  const { userIDtocreate, password } = req.body;
  const { userID, role } = req;

  if (!userID || role !== "admin") {
    res.status(401).send({ error: "You are not authorized" });
    return;
  }

  try {
    // Check if the userID already exists
    const existingUser = await User.findOne({ userIDtocreate });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with default values
    const newUser = new User({
      userID:userIDtocreate,
      password: hashedPassword,
    });
    newUser.role = "user";
    newUser.name = "-";
    newUser.status = null;
    newUser.updated = false;

    try {
      // Read the profile picture file
      const imgPath = path.resolve(__dirname, "default-user.webp");
      const profilePicBuffer = await fs.readFile(imgPath);
      
      // Save the profile picture buffer to the user document
      newUser.profilePic = profilePicBuffer;

      // Save the user to the database
      await newUser.save();

      res.status(200).json({ message: "User created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error reading profile picture file" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post(
  "/updateuser",
  authenticateToken,
  upload.single("profilePic"),
  async (req, res) => {
    const { name } = req.body;
    const { userID } = req;

    if (!userID || !name) {
      res.status(400).send({ error: "Required Data is not given" });
      return;
    }

    try {
      // Find the user in the database
      const user = await User.findOne({ userID });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Handle the updated profile picture (assuming it's already in webp format)
      const profilePicBuffer = req.file.buffer;

      // Update user information in the database
      user.name = name;
      user.profilePic = profilePicBuffer;
      user.updated = true;
      await user.save();

      // Send a response indicating success
      res.json({ success: true, user: { userID, name } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);

app.get("/users", authenticateToken, async (req, res) => {
  const { role, userID } = req;

  if (!userID || role !== "admin") {
    res.status(401).send({ error: "You are not authorized" });
    return;
  }
  try {
    // Retrieve all users from the database
    const users = await User.find({ role: { $ne: "admin" } });

    // Map user information to a simplified format
    const userInfo = users.map((user) => ({
      userID: user.userID,
      name: user.name,
      profilePic: user.profilePic.toString("base64"), // Convert Buffer to base64 for sending in JSON
      status: user.status,
      updated: user.updated, // Assuming you have a field named 'updatedAt' in your user schema
    }));

    res.status(200).json(userInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/approve", authenticateToken, async (req, res) => {
  const { approval, userIDtoupdate } = req.body;
  const { userID, role } = req;

  if (!userID || role !== "admin") {
    res.status(401).send({ error: "You are not authorized" });
    return;
  }

  try {
    // Find the user in the database
    const user = await User.findOne({ userID: userIDtoupdate });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user information in the database
    user.status = approval;
    user.updated = false;
    await user.save();

    // Send a response indicating success
    res.json({ message: "Approval registered" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.delete("/deleteUser", authenticateToken, async (req, res) => {
  const { userIDtodelete } = req.body;
  const { userID, role } = req;

  if (!userID || role !== "admin") {
    res.status(401).send({ error: "You are not authorized" });
    return;
  }

  try {
    // Find the user in the database
    const user = await User.findOne({ userID: userIDtodelete });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user information in the database
    if (user.status !== null && user.name !== "-") {
        const imgPath = path.resolve(__dirname, "default-user.webp");
        const profilePicBuffer = await fs.readFile(imgPath);
      user.name = "-";
      user.status = null;
      user.updated = false;
      user.profilePic = profilePicBuffer;
      await user.save();
      console.log("here")
    }
    else {
         await User.deleteOne({userID:userIDtodelete})
    }

    // Send a response indicating success
    res.json({ message: "user reset", DeletedUser:user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  createAdminUser();
});
