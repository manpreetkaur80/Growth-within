
import "dotenv/config";
import nodemailer from "nodemailer";
import express    from "express";
import mongoose   from "mongoose";
import cors       from "cors";
import bcrypt     from "bcryptjs";
import jwt        from "jsonwebtoken";

const app = express();
app.use(cors({
  origin: "*",
  credentials: false
}));
app.use(express.json());
 
// ── Connect to MongoDB 
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/growthApp")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

const JWT_SECRET = process.env.JWT_SECRET || "growthwithin_secret_2026";

// ── Auth Middleware 
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const UserSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true, lowercase: true },
  password:         { type: String, required: true },
  createdAt:        { type: Date, default: Date.now },
  resetToken:       { type: String, default: null },
  resetTokenExpiry: { type: Date,   default: null },
});

const User = mongoose.model("User", UserSchema);

// Register
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed });

    const token = jwt.sign({ userId: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Get current user
app.get("/auth/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  res.json(user);
});


// ── Nodemailer transporter 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Forgot password 
app.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: "If that email exists, a reset link has been sent." });

   
    const resetToken  = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
    user.resetToken       = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

   
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl    = `${frontendUrl}/reset-password/${resetToken}`;

  
    await transporter.sendMail({
      from:    `"Growth with-in" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: "Reset your Growth with-in password",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #faf8ff; border-radius: 16px;">
          <h1 style="font-size: 28px; color: #1a1040; margin-bottom: 8px;">Reset your password ✦</h1>
          <p style="color: #9499b0; font-size: 15px; margin-bottom: 28px;">
            Hi ${user.name}, someone requested a password reset for your Growth with-in account.
            If this wasn't you, you can safely ignore this email.
          </p>
          <a href="${resetUrl}"
            style="display: inline-block; padding: 14px 32px; border-radius: 50px;
                   background: linear-gradient(135deg, #ff006e, #8338ec);
                   color: #fff; font-weight: 700; font-size: 15px;
                   text-decoration: none; margin-bottom: 24px;">
            Reset Password →
          </a>
          <p style="color: #c0c4d8; font-size: 13px;">This link expires in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #e0d8ff; margin: 24px 0;" />
          <p style="color: #c0c4d8; font-size: 12px;">Growth with-in · Built for growth ✦</p>
        </div>
      `,
    });

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Reset password
app.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ error: "Token and password are required" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({ error: "Reset link is invalid or has expired" });
    }

   
    const user = await User.findById(decoded.userId);
    if (!user || user.resetToken !== token || user.resetTokenExpiry < new Date())
      return res.status(400).json({ error: "Reset link is invalid or has expired" });

    // Update password
    user.password         = await bcrypt.hash(password, 10);
    user.resetToken       = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ── Seed demo account + dummy data 
const seedDemoAccount = async () => {
  try {
    let demoUser = await User.findOne({ email: "demo@growthwithin.app" });
    if (!demoUser) {
      const hashed = await bcrypt.hash("demo123456", 10);
      demoUser = await User.create({ name: "Alex Demo", email: "demo@growthwithin.app", password: hashed });
      console.log("✅ Demo account created");
    }

    const uid = demoUser._id;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
    const yestStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,"0")}-${String(yesterday.getDate()).padStart(2,"0")}`;
    const monthStr = todayStr.slice(0,7);

    // ── Todos ──
    const todoCount = await Todo.countDocuments({ userId: uid });
    if (todoCount === 0) {
      await Todo.insertMany([
        { userId: uid, task: "Review morning routine",         date: todayStr, done: true },
        { userId: uid, task: "Read for 20 minutes",            date: todayStr, done: false },
        { userId: uid, task: "Go for a 30 min walk",           date: todayStr, done: false },
        { userId: uid, task: "Update portfolio README",        date: null,     done: false },
        { userId: uid, task: "Learn one new CSS technique",    date: null,     done: true },
        { userId: uid, task: "Call parents this week",         date: null,     done: false },
        { userId: uid, task: "Plan weekend meals",             date: yestStr,  done: true },
        { userId: uid, task: "Write gratitude journal",        date: yestStr,  done: true },
      ]);
      console.log("✅ Demo todos seeded");
    }

    // ── Goals ──
    const GoalSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:       String,
  description: String,
  category:    String,
  milestones:  [{ step: String, done: { type: Boolean, default: false } }],
});

const Goal = mongoose.model("Goal", GoalSchema);

app.get("/goals", authMiddleware, async (req, res) => {
  const goals = await Goal.find({ userId: req.user.userId });
  res.json(goals);
});

app.post("/goals", authMiddleware, async (req, res) => {
  const { title, description, category, milestones } = req.body;
  const goal = new Goal({ userId: req.user.userId, title, description, category, milestones });
  await goal.save();
  res.json(goal);
});

// ── NEW: full edit (title, description, category, milestones) ──
app.put("/goals/:goalId", authMiddleware, async (req, res) => {
  const { goalId } = req.params;
  const { title, description, category, milestones } = req.body;
  const goal = await Goal.findOneAndUpdate(
    { _id: goalId, userId: req.user.userId },
    { title, description, category, milestones },
    { new: true }
  );
  if (!goal) return res.status(404).json({ error: "Goal not found" });
  res.json(goal);
});

app.put("/goals/:goalId/milestone/:index", authMiddleware, async (req, res) => {
  const { goalId, index } = req.params;
  const { done } = req.body;
  const goal = await Goal.findOne({ _id: goalId, userId: req.user.userId });
  if (!goal) return res.status(404).json({ error: "Goal not found" });
  goal.milestones[index].done = done;
  await goal.save();
  res.json(goal);
});

app.delete("/goals/:id", authMiddleware, async (req, res) => {
  await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.json({ success: true });
});



    // const goalCount = await Goal.countDocuments({ userId: uid });
    // if (goalCount === 0) {
    //   await Goal.insertMany([
    //     {
    //       userId: uid, title: "Land a Frontend Developer Job",
    //       description: "Build a strong portfolio and apply to 5 companies per week.",
    //       category: "career",
    //       milestones: [
    //         { step: "Finish portfolio project",         done: true },
    //         { step: "Write compelling README files",    done: true },
    //         { step: "Deploy all projects live",         done: false },
    //         { step: "Apply to 20 companies",            done: false },
    //         { step: "Complete 3 technical interviews",  done: false },
    //       ],
    //     },
    //     {
    //       userId: uid, title: "Build a Consistent Fitness Habit",
    //       description: "Work out at least 4 times a week for 3 months.",
    //       category: "health",
    //       milestones: [
    //         { step: "Buy gym membership",             done: true },
    //         { step: "Complete first week (4 workouts)",done: true },
    //         { step: "Complete first month",           done: true },
    //         { step: "Complete 3 months",              done: false },
    //       ],
    //     },
    //     {
    //       userId: uid, title: "Read 12 Books This Year",
    //       description: "One book per month across different genres.",
    //       category: "personal",
    //       milestones: [
    //         { step: "Read Atomic Habits",       done: true },
    //         { step: "Read Deep Work",           done: true },
    //         { step: "Read The Alchemist",       done: true },
    //         { step: "Read 4 more books",        done: false },
    //         { step: "Complete all 12",          done: false },
    //       ],
    //     },
    //   ]);
    //   console.log("✅ Demo goals seeded");
    // }

    // ── Habits ──
    const habitGrid = await HabitGrid.findOne({ userId: uid, month: monthStr });
    if (!habitGrid) {
      const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
      const todayNum = today.getDate();

      const makeStatus = (startDay, skipDays = []) => {
        const status = {};
        for (let d = 1; d <= todayNum; d++) {
          const dateKey = `${monthStr}-${String(d).padStart(2,"0")}`;
          status[dateKey] = !skipDays.includes(d);
        }
        return status;
      };

      await HabitGrid.create({
        userId: uid, month: monthStr,
        habits: [
          { name: "Morning Meditation 🧘", statusByDate: makeStatus(1, [3, 7]) },
          { name: "Read 20 mins 📚",       statusByDate: makeStatus(1, [5]) },
          { name: "Workout 💪",            statusByDate: makeStatus(1, [2, 6, 9]) },
          { name: "No social media before 9am 📵", statusByDate: makeStatus(1, [4, 8]) },
        ],
      });
      console.log("✅ Demo habits seeded");
    }

    // ── Journal ──
    const journalCount = await Journal.countDocuments({ userId: uid });
    if (journalCount === 0) {
      await Journal.insertMany([
        {
          userId: uid, date: todayStr,
          mood: "happy",
          wentWell: "Had a really productive coding session this morning. Finally got the authentication flow working end-to-end.",
          difficult: "Struggled with focus in the afternoon after lunch. Need to take shorter breaks.",
          tweak: "Try the Pomodoro technique tomorrow — 25 min work, 5 min break.",
          entry: "Feeling good about the direction this project is heading. The UI is really coming together and I'm proud of the design system I built from scratch. Reminder to self: progress over perfection.",
        },
        {
          userId: uid, date: yestStr,
          mood: "neutral",
          wentWell: "Got through my entire to-do list and even went for a walk in the evening.",
          difficult: "Felt a bit unmotivated in the morning, took a while to get started.",
          tweak: "Prepare tomorrow's tasks the night before to hit the ground running.",
          entry: "Some days are just steady, not spectacular. And that's okay. Consistency beats intensity in the long run.",
        },
      ]);
      console.log("✅ Demo journal entries seeded");
    }

    // ── Vision Board ──
    const visionCount = await VisionTile.countDocuments({ userId: uid });
    if (visionCount === 0) {
      await VisionTile.insertMany([
        { userId: uid, tileId: "demo_v1", url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80", label: "Dream workspace", category: "Career",   author: "Marvin Meyer", order: 0 },
        { userId: uid, tileId: "demo_v2", url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80", label: "Travel — mountains", category: "Travel",   author: "Simon Migaj", order: 1 },
        { userId: uid, tileId: "demo_v3", url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", label: "Stay fit", category: "Health",   author: "Risen Wang", order: 2 },
        { userId: uid, tileId: "demo_v4", url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80", label: "Dream home", category: "Finance",  author: "Tierra Mallorca", order: 3 },
        { userId: uid, tileId: "demo_v5", url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80", label: "Keep reading", category: "Personal", author: "Thought Catalog", order: 4 },
        { userId: uid, tileId: "demo_v6", url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80", label: "Good friendships", category: "Relationships", author: "Priscilla Du Preez", order: 5 },
      ]);
      console.log("✅ Demo vision board seeded");
    }

  } catch (err) {
    console.error("Demo seed error:", err);
  }
};
mongoose.connection.once("open", seedDemoAccount);

const JournalSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date:      String,
  mood:      String,
  wentWell:  String,
  difficult: String,
  tweak:     String,
  entry:     String,
});

const Journal = mongoose.model("Journal", JournalSchema);


app.post("/journal/:date", authMiddleware, async (req, res) => {
  const { date } = req.params;
  const { mood, wentWell, difficult, tweak, entry } = req.body;
  const saved = await Journal.findOneAndUpdate(
    { date, userId: req.user.userId },
    { $set: { mood, wentWell, difficult, tweak, entry } },
    { upsert: true, new: true }
  );
  res.json(saved);
});

app.get("/journal/:date", authMiddleware, async (req, res) => {
  const { date } = req.params;
  const journal = await Journal.findOne({ date, userId: req.user.userId });
  res.json(journal || { mood: "", wentWell: "", difficult: "", tweak: "", entry: "" });
});

const HabitGridSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month:  String,
  habits: [
    {
      name:         String,
      statusByDate: { type: Map, of: Boolean },
    },
  ],
});

const HabitGrid = mongoose.model("HabitGrid", HabitGridSchema);


app.post("/habitgrid", authMiddleware, async (req, res) => {
  const { month, habits } = req.body;
  const grid = new HabitGrid({ userId: req.user.userId, month, habits });
  await grid.save();
  res.json(grid);
});

app.get("/habitgrid/:month", authMiddleware, async (req, res) => {
  const { month } = req.params;
  let grid = await HabitGrid.findOne({ month, userId: req.user.userId });
  if (!grid) {
    grid = new HabitGrid({ userId: req.user.userId, month, habits: [] });
    await grid.save();
  }
  res.json(grid);
});

// Add habit
app.put("/habitgrid/:month/addhabit", authMiddleware, async (req, res) => {
  const { month } = req.params;
  const { name } = req.body;
  let grid = await HabitGrid.findOne({ month, userId: req.user.userId });
  if (!grid) grid = new HabitGrid({ userId: req.user.userId, month, habits: [] });
  grid.habits.push({ name, statusByDate: {} });
  await grid.save();
  res.json(grid);
});

// Toggle check-in
app.put("/habitgrid/:month/:habitName/:date", authMiddleware, async (req, res) => {
  const { month, habitName, date } = req.params;
  const { done } = req.body;
  const grid = await HabitGrid.findOne({ month, userId: req.user.userId });
  if (!grid) return res.status(404).json({ error: "Grid not found" });
  const habit = grid.habits.find(h => h.name === habitName);
  if (!habit) return res.status(404).json({ error: "Habit not found" });
  habit.statusByDate.set(date, done);
  await grid.save();
  res.json(grid);
});

// Delete habit
app.delete("/habitgrid/:month/:habitName", authMiddleware, async (req, res) => {
  const { month, habitName } = req.params;
  const grid = await HabitGrid.findOne({ month, userId: req.user.userId });
  if (!grid) return res.status(404).json({ error: "Grid not found" });
  grid.habits = grid.habits.filter(h => h.name !== habitName);
  await grid.save();
  res.json(grid);
});


const TodoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  task:   String,
  done:   { type: Boolean, default: false },
  date:   { type: String, default: null }, // null = general, YYYY-MM-DD = daily
});

const Todo = mongoose.model("Todo", TodoSchema);


app.get("/todos", authMiddleware, async (req, res) => {
  const todos = await Todo.find({ userId: req.user.userId });
  res.json(todos);
});


app.post("/todos", authMiddleware, async (req, res) => {
  const { task, date } = req.body;                       
  const todo = new Todo({ userId: req.user.userId, task, date: date || null }); 
  await todo.save();
  res.json(todo);
});


app.put("/todos/:id", authMiddleware, async (req, res) => {
  const { done } = req.body;
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { done },
    { new: true }
  );
  res.json(todo);
});


app.delete("/todos/:id", authMiddleware, async (req, res) => {
  await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.json({ success: true });
});

const GoalSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:       String,
  description: String,
  category:    String,
  milestones:  [{ step: String, done: { type: Boolean, default: false } }],
});

const Goal = mongoose.model("Goal", GoalSchema);

app.get("/goals", authMiddleware, async (req, res) => {
  const goals = await Goal.find({ userId: req.user.userId });
  res.json(goals);
});

app.post("/goals", authMiddleware, async (req, res) => {
  const { title, description, category, milestones } = req.body;
  const goal = new Goal({ userId: req.user.userId, title, description, category, milestones });
  await goal.save();
  res.json(goal);
});

app.put("/goals/:goalId/milestone/:index", authMiddleware, async (req, res) => {
  const { goalId, index } = req.params;
  const { done } = req.body;
  const goal = await Goal.findOne({ _id: goalId, userId: req.user.userId });
  if (!goal) return res.status(404).json({ error: "Goal not found" });
  goal.milestones[index].done = done;
  await goal.save();
  res.json(goal);
});

app.delete("/goals/:id", authMiddleware, async (req, res) => {
  await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.json({ success: true });
});


const VisionTileSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tileId:   { type: String, required: true },   // client-side unique id
  url:      { type: String, required: true },   // image URL or base64
  label:    { type: String, default: "" },
  category: { type: String, default: "Personal" },
  author:   { type: String, default: "" },
  order:    { type: Number, default: 0 },
});

const VisionTile = mongoose.model("VisionTile", VisionTileSchema);


app.get("/visionboard", authMiddleware, async (req, res) => {
  const tiles = await VisionTile.find({ userId: req.user.userId }).sort({ order: 1 });
  res.json(tiles);
});


app.post("/visionboard", authMiddleware, async (req, res) => {
  const { tileId, url, label, category, author, order } = req.body;
  // Prevent duplicates — if tileId already exists for user, just return it
  const existing = await VisionTile.findOne({ userId: req.user.userId, tileId });
  if (existing) return res.json(existing);
  const tile = new VisionTile({ userId: req.user.userId, tileId, url, label, category, author, order });
  await tile.save();
  res.json(tile);
});


app.delete("/visionboard/:tileId", authMiddleware, async (req, res) => {
  await VisionTile.findOneAndDelete({ userId: req.user.userId, tileId: req.params.tileId });
  res.json({ success: true });
});

app.put("/visionboard/reorder", authMiddleware, async (req, res) => {
  const { order } = req.body; // [{ tileId, order }, ...]
  await Promise.all(
    order.map(({ tileId, order: o }) =>
      VisionTile.findOneAndUpdate({ userId: req.user.userId, tileId }, { order: o })
    )
  );
  res.json({ success: true });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running at http://localhost:${PORT}`));