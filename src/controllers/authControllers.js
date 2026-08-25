exports.register = async (req, res) => {
  res.status(200).json({ message: "Endpoint Register" });
};

exports.login = async (req, res) => {
  res.status(200).json({ message: "Endpoint Login" });
};
