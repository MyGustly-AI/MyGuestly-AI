import {registerUser, loginUser, refreshUserToken, logoutUser, getCurrentUser, updateProfile, changePasswordService} from "./authService.js";

// Registration controller to handle user registration requests
export const register = async (req, res, next) => {
    try {
        const result = await registerUser(
            req.body
        );
        res.status(201).json({
            success: true,
            data: result,
            message: "User registered successfully",
        });
    } catch (error) {
        next(error);
    }
};

// Login controller to handle user login requests
export const login = async (req, res, next) => {
    try {
        const result = await loginUser(
            req.body
        );

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            });

        res.status(200).json({
            success: true,
            data: result,
            message: "Login successful",
        });
    } catch (error) {
        next(error);
    }
};

// Refresh token controller to handle token refresh requests
export const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        const result = await refreshUserToken(refreshToken);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Logout controller to handle user logout requests
export const logout = async (req, res, next) => {
    try {
        await logoutUser(req.user.userId);

        res.clearCookie("refreshToken");
        
        res.json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        next(error);
        }
};

// Controller to get current authenticated user information
export const me = async (req, res, next) => {
    try {
        const user =
            await getCurrentUser(
                req.user.userId
            );

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// Controller to update user profile information
export const updateMyProfile = async (req, res, next) => {
        try {
            const user =
                await updateProfile(
                    req.user.userId,
                    req.body
                );

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
};

// Controller to change user password
export const changePassword = async (req, res, next) => {
    try {
        await changePasswordService(
            req.user.id,
            req.body.currentPassword,
            req.body.newPassword
        );

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        next(error);
    }
};

// Controller to delete user account
export const deleteMyAccount = async (req, res, next) => {
    try {
        await deleteUserAccount(req.user.id);

        res.clearCookie("refreshToken");

        res.status(200).json({
            success: true,
            message: "Account deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};