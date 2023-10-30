const Expense = require("../models/expense");
const User = require("../models/user");

exports.createExpenseController = async (req, res) => {
  const { amount, description, category } = req.body;

  try {
    if (!amount || !description || !category) {
      return res.status(400).json({ error: "Fill all fields" });
    }

    const newExpense = new Expense({
      amount,
      description,
      category,
      userId: req.user.id,
    });

    const data = await newExpense.save();
    res.status(201).json({ newExpenseDetail: data });
  } catch (err) {
    console.log("error" + err);
    res.status(500).json({ error: err });
  }
};

exports.getExpenseController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch data from the database using Mongoose
    const data = await Expense.find({ userId: req.user.id })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ expense: data });
  } catch (err) {
    console.log("something went wrong", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const uId = req.params.id;
    console.log(uId);
    if (uId == "undefined" || uId.length === 0) {
      console.log("ID is missing");
      return res.status(400).json({ success: false });
    }

    // Fetch the user's total expense
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const userTotalExpense = user.totalExpense;

    console.log("Expenses >>>", userTotalExpense);

    let deleteditemprice;
    const getDeletedExpense = await Expense.findOne({
      _id: uId,
      userId: req.user.id,
    });

    if (!getDeletedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense doesn't belong to the user",
      });
    }

    console.log("getDeletedExpense>>>", getDeletedExpense.amount);
    deleteditemprice = getDeletedExpense.amount;

    let updatedTotalExpense = userTotalExpense - deleteditemprice;
    console.log("updatedTotalExpense>>>", updatedTotalExpense);

    // Delete the expense
    await Expense.findByIdAndRemove(uId);

    // Update the user's totalExpense
    user.totalExpense = updatedTotalExpense;
    await user.save();

    console.log("Expense deleted successfully");
    return res
      .status(200)
      .json({ success: true, message: "Deleted Successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Failed" });
  }
};
