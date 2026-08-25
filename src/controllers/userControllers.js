exports.getAllUsers = async (req, res) => {
  res.status(200).json({ message: "Mengambil semua user (Read)" });
};

exports.createUser = async (req, res) => {
  res.status(201).json({ message: "Menambah user baru (Create)" });
};

exports.updateUser = async (req, res) => {
  res.status(200).json({ message: "Mengubah data user (Update)" });
};

exports.deleteUser = async (req, res) => {
  res.status(200).json({ message: "Menghapus user (Delete)" });
};
