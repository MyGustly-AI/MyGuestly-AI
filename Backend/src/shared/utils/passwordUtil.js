import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

// Hash user password before saving to database
export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

// Compare provided password with stored hash
export const comparePassword = async (password, hashPassword) => {
    return bcrypt.compare(password, hashPassword);
};