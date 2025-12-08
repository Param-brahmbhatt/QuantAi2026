import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "../Authentication/pages/LoginPage";
import PasswordResetPage from "../Authentication/pages/ForgotPassword";
import EmailVerificationPage from "../Authentication/pages/VerifyEmail";
import ResetPassword from "../Authentication/pages/ResetPassword";
import SignupUI from "../Authentication/pages/RegisterPage";
import WelcomePage from "../Authentication/pages/WelcomePage";
import Dashboard from "../Pages/Dashboard/Dashboard";
import RewardsPage from "../Pages/Earnings/Rewards/RewardsPage";
import ProfilePage from "../Pages/Profile/ProfilePage";
import Transactions from "../Pages/Earnings/Transactions/TransactionsPage";
import UserTable from "../Pages/User/ViewUser";
import AddUserForm from "../Pages/User/AddUser";
import ProjectOverviewCards from "../Pages/Projects/ViewProjects";
import AddProjectForm from "../Pages/Projects/AddProject";
import ProjectDetail from "../Pages/Projects/ProjectDetail";
import MasterDataPage from "../Pages/MasterData/MasterDataPage";
import RedemptionSettings from "../Pages/Settings/Redemption";

export const AppRoutes = () => {
        return (
                <Routes>
                        {/* //////////// AUTH ROUTES ////////////// */}
                        <Route path="/Login" element={<LoginPage />} />
                        <Route path="/forgot-password" element={<PasswordResetPage />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/verify-email" element={<EmailVerificationPage />} />
                        <Route path="/register" element={<SignupUI />} />
                        <Route path="/welcome" element={<WelcomePage />} />

                        {/* //////////// Dashboard ////////////// */}
                        <Route path="/" element={<Dashboard />} />

                        {/* //////////// Users ////////////// */}
                        <Route path="/users" element={<UserTable />} />
                        <Route path="/users/new-add" element={<AddUserForm />} />

                        {/* //////////// Projects //////////// */}
                        <Route path="/projects" element={<ProjectOverviewCards />} />
                        <Route path="/projects/add-project" element={<AddProjectForm />} />
                        <Route path="/projects/:projectId/edit" element={<ProjectDetail />} />

                        {/* //////////// Master Data //////////// */}
                        <Route path="/master-data" element={<MasterDataPage />} />

                        {/* //////////// Earnings children ////////////// */}
                        <Route path="/rewards" element={<RewardsPage />} />
                        <Route path="/settings/transactions" element={<Transactions />} />

                        {/* //////////// Profile ////////////// */}
                        <Route path='/profile' element={<ProfilePage />} />
                        
                        {/* /////////// Settings ////////////// */}
                        <Route path="/settings/redeemptions" element={<RedemptionSettings/>} />
                </Routes>
        )
}