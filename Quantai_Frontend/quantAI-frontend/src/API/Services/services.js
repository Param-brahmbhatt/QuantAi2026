import { axiosGet, axiosPost } from "../Handler/handler"


/////////// Login ///////////
export const UserLogin = async (data) => {
    const response = await axiosPost('/api/users/login/', data)
    return response
}

///////// sign up //////////
export const SignUp = async (data) => {
    const response = await axiosPost('/api/users/signup/', data)
    return response
}

///////// Verify OTP //////////
export const VerifyOTP = async (data) => {
    const response = await axiosPost('/api/users/verify-otp/', data)
    return response
}

///////// Login with OTP //////////
export const LoginWithOTP = async (data) => {
    const response = await axiosPost('/api/users/login-with-otp/', data)
    return response
}

///////// Request OTP for Login //////////
export const RequestOTPLogin = async (data) => {
    const response = await axiosPost('/api/users/request-otp-login/', data)
    return response
}

///////// Get The User ////////////
export const GetUserDetails = async () => {
    const response = await axiosGet('/api/users/users/me/')
    return response.data
}

///////// Get Project ////////////
export const GetProjectList = async () => {
    const response = await axiosGet('/api/projects/')
    return response?.data || response || []
}

///////// Create Project ////////////
export const CreateProject = async (data) => {
    const response = await axiosPost('/api/projects/surveys/', data)
    return response.data 
}