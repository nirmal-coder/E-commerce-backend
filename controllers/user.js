const user = require("../model/user");

const getUser = (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.emailId,
    },
  });
};

const updateUser = async (req, res) => {
  try {
    const { username, address } = req.body;
    const { id } = req.user;
    const updatedUser = await user.findByIdAndUpdate(
      id,
      { username, address },
      { new: true, runValidators: true }
    );

    console.log("updated user => ", updatedUser);
    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        emailId: updatedUser.emailId,
        address: updatedUser?.address,
      },
    });
  } catch (error) {
    console.log("error from updating user" + error);
    resres.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// deleting user Own Account
const deleteUser = async (req, res) => {
  try {
    const { id } = req.user;
    const deleteUser = await user.findByIdAndDelete(id);
    console.log("deleted user => ", deleteUser);
    res.status(200).json({
      success: true,
      message: "user Account deleted successfully!.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong! , Try Again.",
    });
  }
};
module.exports = { getUser, updateUser, deleteUser };
