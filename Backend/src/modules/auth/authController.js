import { registerUser, loginUser, refreshUserToken, logoutUser, getCurrentUser, updateProfile, changePassword, verifyEmail, forgotPassword, resetPassword, deleteUserAccount } from "./authService.js";
import { ApiResponse } from "../../utils/ApiResponse.js";



// Registration controller to handle user registration requests
export const register = async (req, res, next) => {
    try {
        const result = await registerUser(req.body);
        return ApiResponse.created(res, "User registered successfully", {
            user: result.user,
            accessToken: result.accessToken,
        });
    } catch (error) {
        next(error);
    }
};

// Email verification controller to handle email verification requests
export const verifyEmailController = async (req, res, next) => {
    try {
        const { token } = req.query;

        await verifyEmail(token);

        return ApiResponse.success(
            res,
            "Email verified successfully"
        );
    } catch (error) {
        next(error);
    }
};



// Login controller to handle user login requests
export const login = async (req, res, next) => {
    try {
        const result = await loginUser(req.body);
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return ApiResponse.success(res, "Login successful", {
            user: result.user,
            accessToken: result.accessToken,
        });
    } catch (error) {
        next(error);
    }
};




// Refresh token controller to handle token refresh requests
export const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        const oldAccessToken = req.headers.authorization?.split(" ")[1];
        const result = await refreshUserToken(refreshToken, oldAccessToken);
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return ApiResponse.success(res, "Token refreshed successfully", {
            accessToken: result.accessToken,
        });
    } catch (error) {
        next(error);
    }
};




// Logout controller to handle user logout requests
export const logout = async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization?.split(" ")[1];
        await logoutUser(req.user.userId, accessToken);
        res.clearCookie("refreshToken");
        return ApiResponse.success(res, "Logged out successfully");
    } catch (error) {
        next(error);
    }
};




// Controller to get current authenticated user information
export const me = async (req, res, next) => {
    try {
        const user = await getCurrentUser(req.user.userId);
        return ApiResponse.success(res, "User retrieved successfully", user);
    } catch (error) {
        next(error);
    }
};




// Controller to update user profile information
export const updateMyProfile = async (req, res, next) => {
    try {
        const user = await updateProfile(req.user.userId, req.body);
        return ApiResponse.success(res, "Profile updated successfully", user);
    } catch (error) {
        next(error);
    }
};




// Controller to change user password
export const updatePassword = async (req, res, next) => {
    try {
        await changePassword(
            req.user.userId,
            req.body.currentPassword,
            req.body.newPassword
        );
        return ApiResponse.success(res, "Password changed successfully");
    } catch (error) {
        next(error);
    }
};



// Controller to handle forgot password requests and send reset email
export const forgotPasswordController = async (req, res, next) => {
    try {
        await forgotPassword(req.body.email);

        return ApiResponse.success(
            res,
            "If an account exists with that email, a password reset link has been sent."
        );
    } catch (error) {
        next(error);
    }
};



// Controller to handle password reset requests using reset token
export const resetPasswordController = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        await resetPassword(
            token,
            newPassword
        );

        return ApiResponse.success(
            res,
            "Password reset successfully"
        );
    } catch (error) {
        next(error);
    }
};



// Controller to delete user account
export const deleteMyAccount = async (req, res, next) => {
    try {
        await deleteUserAccount(req.user.userId);
        res.clearCookie("refreshToken");
        return ApiResponse.success(res, "Account deleted successfully");
    } catch (error) {
        next(error);
    }
};