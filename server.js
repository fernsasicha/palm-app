process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// require ก่อน
const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const cors = require("cors");
const ExcelJS = require("exceljs");



mongoose.connect("mongodb+srv://palmappadmin_db_user:Palm2026@cluster0.hdwwyrz.mongodb.net/palmdb?retryWrites=true&w=majority")
  .then(() => console.log("✅ เชื่อม MongoDB สำเร็จ"))
  .catch(err => console.log(err));


// ✅  Cloudinary Config
cloudinary.config({
  cloud_name: "t14h1yhx",
  api_key: "117282587315936",
  api_secret: "NHd--dngs5jk6VhIARM-KS_tD7E"
});

// ✅  multer
const upload = multer({
  dest: "uploads/"
});



// ✅  Income model
const Income = mongoose.model("Income", {
  farmId: String,
  type: String,
  date: Date,
  weight: Number,
  price: Number,
  total: Number,
  receiptImage: String
});

// ✅  Expense Model
const Expense = mongoose.model("Expense", {
  farmId: String,
  type: String,
  date: Date,
  item: String,
  quantity: Number,
  price: Number,
  total: Number,
  receiptImage: String
});

// ✅  Farm Model
const Farm = mongoose.model("Farm", {
  name: String,
  location: String,
  area: Number
});

// ✅  Owner Model
const Owner = mongoose.model("Owner", {
  name: String,
  phone: String
});

// ✅  FarmOwner Model
const FarmOwner = mongoose.model("FarmOwner", {
  farmId: String,
  ownerId: String,
  percent: Number
});


// ✅  User Model
const User = mongoose.model("User", {

    fullName: String,

    phone: String,

    password: String,

    ownerId: String,

    role: String,

    citizenLast4: String

});




const app = express();
app.use(cors());
app.use(express.json());



// ✅ middleware ต้องอยู่บน
app.use(express.json());

// ✅ route แรก
app.get("/", (req, res) => {
  res.send("Palm App API ทำงานแล้ว ✅");
});

// ✅ API Income
app.post("/income", async (req, res) => {
const {
  farmId,
  type,
  date,
  weight,
  price,
  receiptImage
} = req.body;

  const total = weight * price;

  const newIncome = new Income({
  farmId,
  type,
  date,
  weight,
  price,
  total,
  receiptImage
});

  await newIncome.save();

  res.json({
    message: "บันทึกสำเร็จ ✅",
    data: newIncome
  });
});

// ✅ API Expense
app.post("/expense", async (req, res) => {
  const {
  farmId,
  type,
  date,
  item,
  quantity,
  price,
  receiptImage
} = req.body;

  const total = quantity * price;

  const newExpense = new Expense({
  farmId,
  type,
  date,
  item,
  quantity,
  price,
  total,
  receiptImage
});

  await newExpense.save();

  res.json({
    message: "บันทึกรายจ่ายสำเร็จ ✅",
    data: newExpense
  });
});

// ✅ API สร้างสวน
app.post("/farm", async (req, res) => {

  const { name, location, area } = req.body;

  const newFarm = new Farm({
    name,
    location,
    area
  });

  await newFarm.save();

  res.json({
    message: "บันทึกสวนสำเร็จ ✅",
    data: newFarm
  });

});

// ✅ API ดูสวนทั้งหมด
app.get("/farm", async (req, res) => {

  const farms = await Farm.find();

  res.json(farms);

});

// ✅ API เพิ่มเจ้าของ
app.post("/owner", async (req, res) => {

  const { name, phone } = req.body;

  const newOwner = new Owner({
    name,
    phone
  });

  await newOwner.save();

  res.json({
    message: "บันทึกเจ้าของสำเร็จ ✅",
    data: newOwner
  });

});

// ✅ API ดูเจ้าของทั้งหมด
app.get("/owner", async (req, res) => {

  const owners = await Owner.find();

  res.json(owners);

});

// ✅ API เชื่อมเจ้าของกับสวน
app.post("/farm-owner", async (req, res) => {

  const {
    farmId,
    ownerId,
    percent
  } = req.body;

  const newFarmOwner = new FarmOwner({
    farmId,
    ownerId,
    percent
  });

  await newFarmOwner.save();

  res.json({
    message: "ผูกเจ้าของกับสวนสำเร็จ ✅",
    data: newFarmOwner
  });

});

// ✅ API Upload
app.post("/upload", upload.single("image"), async (req, res) => {

  try {

    const result = await cloudinary.uploader.upload(
      req.file.path
    );

    res.json({
      message: "อัปโหลดสำเร็จ ✅",
      imageUrl: result.secure_url
    });

  } catch (error) {

console.log(error); // เพิ่มบรรทัดนี้

    res.status(500).json({
      error: error.message
    });

  }

});

// ✅ API สร้าง Dashboard
app.get("/dashboard", async (req, res) => {

  const incomes = await Income.find();
  const expenses = await Expense.find();

  const totalIncome =
    incomes.reduce(
      (sum, item) => sum + item.total,
      0
    );

  const totalExpense =
    expenses.reduce(
      (sum, item) => sum + item.total,
      0
    );

  const profit =
    totalIncome - totalExpense;

  res.json({
    totalIncome,
    totalExpense,
    profit
  });

});

// ✅ API เพิ่มดูรายรับทั้งหมด
app.get("/income", async (req, res) => {

  const incomes = await Income.find();

  res.json(incomes);

});

// ✅ API เพิ่มดูรายจ่ายทั้งหมด
app.get("/expense", async (req, res) => {

  const expenses = await Expense.find();

  res.json(expenses);

});

// ✅ API ลบรายรับ
app.delete("/income/:id", async (req, res) => {

  await Income.findByIdAndDelete(
    req.params.id
  );

  res.json({
    message: "ลบรายรับสำเร็จ ✅"
  });

});

// ✅ API ลบรายจ่าย
app.delete("/expense/:id", async (req, res) => {

  await Expense.findByIdAndDelete(
    req.params.id
  );

  res.json({
    message: "ลบรายจ่ายสำเร็จ ✅"
  });

});

// ✅ API ลบเจ้าของ
app.delete("/owner/:id", async (req, res) => {

    await Owner.findByIdAndDelete(
        req.params.id
    );

    res.json({
        message: "ลบเจ้าของสำเร็จ ✅"
    });

});

// ✅ API รายงานรายสวน
app.get("/farm-report/:farmId", async (req, res) => {

    const farmId = req.params.farmId;

    const incomes =
        await Income.find({ farmId });

    const expenses =
        await Expense.find({ farmId });

    const farmOwners =
        await FarmOwner.find({ farmId });

    const ownerDetails = [];

    for (const owner of farmOwners) {

        const ownerInfo =
            await Owner.findById(owner.ownerId);

        ownerDetails.push({
            name: ownerInfo?.name || "ไม่พบชื่อ",
            percent: owner.percent
        });

    }

    const totalIncome =
        incomes.reduce(
            (sum, item) => sum + item.total,
            0
        );

    const totalExpense =
        expenses.reduce(
            (sum, item) => sum + item.total,
            0
        );

    const profit =
        totalIncome - totalExpense;

    res.json({
        totalIncome,
        totalExpense,
        profit,
        owners: ownerDetails
    });

});


// ✅ API แก้ไขรายรับ
app.put("/income/:id", async (req, res) => {

    const updatedIncome =
        await Income.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

    res.json({
        message: "แก้ไขรายรับสำเร็จ ✅",
        data: updatedIncome
    });

});

// ✅ API แก้ไขรายจ่าย
app.put("/expense/:id", async (req, res) => {

    const updatedExpense =
        await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

    res.json({
        message: "แก้ไขรายจ่ายสำเร็จ ✅",
        data: updatedExpense
    });

});


// ✅ API Export
app.get("/export-report", async (req, res) => {

    const incomes = await Income.find();
    const expenses = await Expense.find();

    const totalIncome =
        incomes.reduce(
            (sum, item) => sum + item.total,
            0
        );

    const totalExpense =
        expenses.reduce(
            (sum, item) => sum + item.total,
            0
        );

    const profit =
        totalIncome - totalExpense;

    const workbook =
        new ExcelJS.Workbook();

    // Sheet 1
    const summarySheet =
        workbook.addWorksheet("Summary");

    summarySheet.addRow([
        "รายการ",
        "จำนวนเงิน"
    ]);

    summarySheet.addRow([
        "รายรับรวม",
        totalIncome
    ]);

    summarySheet.addRow([
        "รายจ่ายรวม",
        totalExpense
    ]);

    summarySheet.addRow([
        "กำไรสุทธิ",
        profit
    ]);

    // Sheet 2
    const incomeSheet =
        workbook.addWorksheet("Income");

    incomeSheet.columns = [

        {
            header: "วันที่",
            key: "date",
            width: 20
        },

        {
            header: "ประเภท",
            key: "type",
            width: 20
        },

        {
            header: "ยอดรวม",
            key: "total",
            width: 15
        }

    ];

    incomes.forEach(item => {

        incomeSheet.addRow({

            date: item.date
                ? item.date.toLocaleDateString("th-TH")
                : "-",

            type: item.type,

            total: item.total

        });

    });

    // Sheet 3
    const expenseSheet =
        workbook.addWorksheet("Expense");

    expenseSheet.columns = [

        {
            header: "วันที่",
            key: "date",
            width: 20
        },

        {
            header: "ประเภท",
            key: "type",
            width: 20
        },

        {
            header: "ยอดรวม",
            key: "total",
            width: 15
        }

    ];

    expenses.forEach(item => {

        expenseSheet.addRow({

            date: item.date
                ? item.date.toLocaleDateString("th-TH")
                : "-",

            type: item.type,

            total: item.total

        });

    });

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=palm-report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

});


// ✅ API หา Farm ตาม id
app.get("/farm/:id", async (req, res) => {

    const farm =
        await Farm.findById(
            req.params.id
        );

    res.json(farm);

});




// ✅ API /farm-owner
app.get("/farm-owner", async (req, res) => {

    const data =
        await FarmOwner.find();

    res.json(data);

});


// ✅ API ดูรายรับ 1 รายการ
app.get("/income/:id", async (req, res) => {

    const income =
        await Income.findById(req.params.id);

    res.json(income);

});


// ✅ API ดูรายจ่าย 1 รายการ
app.get("/expense/:id", async (req, res) => {

    const expense =
        await Expense.findById(req.params.id);

    res.json(expense);

});


// ✅ API สมัครสมาชิก
app.post("/register", async (req, res) => {

    const {
        fullName,
        phone,
        password,
        citizenId
    } = req.body;

    const existingUser =
        await User.findOne({
            phone
        });

    if (existingUser) {

        return res.status(400).json({
            message: "เบอร์มือถือถูกใช้งานแล้ว"
        });

    }

    const newOwner =
        new Owner({
            name: fullName,
            phone: phone
        });

    await newOwner.save();

    const citizenLast4 =
        citizenId.slice(-4);

    const newUser =
        new User({

            fullName,

            phone,

            password,

            ownerId:
                newOwner._id,

            role:
                "owner",

            citizenLast4

        });

    await newUser.save();

    res.json({

        message:
            "สมัครสมาชิกสำเร็จ ✅"

    });

});


// ✅ API Login
app.post("/login", async (req, res) => {

    const {
        phone,
        password
    } = req.body;

    const user =
        await User.findOne({

            phone,
            password

        });

    if (!user) {

        return res.status(401).json({

            message:
                "เบอร์หรือรหัสผ่านไม่ถูกต้อง"

        });

    }

    res.json({

        message:
            "เข้าสู่ระบบสำเร็จ ✅",

        userId:
            user._id,

        ownerId:
            user.ownerId,

        role:
            user.role,

        fullName:
            user.fullName

    });

});


// ✅ API ดูข้อมูล User
app.get("/user/:id", async (req, res) => {

    const user =
        await User.findById(
            req.params.id
        );

    res.json(user);

});


// ✅ API หา Farm ของ Owner
app.get("/owner-farms/:ownerId", async (req, res) => {

    const farms =
        await FarmOwner.find({

            ownerId:
                req.params.ownerId

        });

    res.json(farms);

});



// ✅ API จำกัดสิทธิ์ dashboard
app.get("/owner-dashboard/:ownerId", async (req, res) => {

    const ownerId =
        req.params.ownerId;

    const farms =
        await FarmOwner.find({
            ownerId
        });

    const farmIds =
        farms.map(
            item => item.farmId
        );

    const incomes =
        await Income.find({
            farmId: {
                $in: farmIds
            }
        });

    const expenses =
        await Expense.find({
            farmId: {
                $in: farmIds
            }
        });

    const totalIncome =
        incomes.reduce(
            (sum, item) =>
                sum + item.total,
            0
        );

    const totalExpense =
        expenses.reduce(
            (sum, item) =>
                sum + item.total,
            0
        );

    const profit =
        totalIncome - totalExpense;

    res.json({

        totalIncome,
        totalExpense,
        profit

    });

});



// ✅ API จำกัดสิทธิ์ history
app.get("/owner-history/:ownerId", async (req, res) => {

    const ownerId =
        req.params.ownerId;

    const farms =
        await FarmOwner.find({
            ownerId
        });

    const farmIds =
        farms.map(
            item => item.farmId
        );

    const incomes =
        await Income.find({
            farmId: {
                $in: farmIds
            }
        });

    const expenses =
        await Expense.find({
            farmId: {
                $in: farmIds
            }
        });

    res.json({

        incomes,

        expenses

    });

});



// ✅ API จำกัดสิทธิ์ owner-farms
app.get("/owner-farms/:ownerId", async (req, res) => {

    const farms =
        await FarmOwner.find({

            ownerId:
                req.params.ownerId

        });

    res.json(farms);

});

app.get("/owner-farm-list/:ownerId", async (req, res) => {

    const ownerId =
        req.params.ownerId;

    const farmOwners =
        await FarmOwner.find({
            ownerId
        });

    const farms = [];

    for (const item of farmOwners) {

        const farm =
            await Farm.findById(
                item.farmId
            );

        if (farm) {

            farms.push(farm);

        }

    }

    res.json(farms);

});


// ✅ API Reset Password
app.put("/reset-password", async (req, res) => {

    const {
        phone,
        citizenLast4,
        newPassword
    } = req.body;

    const user =
        await User.findOne({

            phone,
            citizenLast4

        });

    if (!user) {

        return res.status(400).json({

            message:
                "ข้อมูลไม่ถูกต้อง"

        });

    }

    user.password =
        newPassword;

    await user.save();

    res.json({

        message:
            "เปลี่ยนรหัสผ่านสำเร็จ ✅"

    });

});


















// ✅ listen ไว้ล่างสุด
app.listen(3000, () => {
  console.log("Server running on port 3000");
});