const bcrypt = require('bcryptjs');

const hashPassword = async (password) => await bcrypt.hash(password, 10);
const comparePassword = async (password, hashed) => await bcrypt.compare(password, hashed);

module.exports = { hashPassword, comparePassword };