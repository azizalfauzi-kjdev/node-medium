const db = require("../config/db");

class UserModel {
  static async getAllUsers() {
    const [rows] = await db.query("SELECT * FROM users");
    return rows;
  }
}

module.exports = UserModel;
