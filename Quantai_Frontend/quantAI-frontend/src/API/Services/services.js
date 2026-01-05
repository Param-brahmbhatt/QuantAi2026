import { axiosDelete, axiosGet, axiosPost, axiosPut } from "../Handler/handler"


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
    return response?.data || response
}

///////// Project ////////////
export const GetProjectList = async () => {
    const response = await axiosGet('/api/projects/surveys/')
    return response?.data || response || []
}
export const CreateProject = async (data) => {
    const response = await axiosPost('/api/projects/surveys/', data)
    return response.data 
}
export const UpdateProject = async() => {
    const response = await axiosPost(`/api/projects/surveys/${project_id}/`, data)
    return response.data
}
export const getProjectById = async (project_id) => {
  const response = await axiosGet(`/api/projects/${project_id}/`);
  return response.data;
};

///////// List Users ////////////
export const ListUser = async () => {
    const response = await axiosGet('/api/users/admin/users/')
    return response
}
export const AddUser = async (data) => {
    const response = await axiosPost('/api/users/admin/users/', data)
    return response.data
}
export const DeleteUser = async (id) => {
    const response = await axiosDelete(`/api/users/admin/users/${id}/`)
    return response.data
}

///////// Logic Nodes ////////////
export const GetLogicNodes = async () => {
    const response = await axiosGet('/api/logic-nodes/')
    return response?.data || response || []
}

export const CreateLogicNode = async (data) => {
    const response = await axiosPost('/api/logic-nodes/', data)
    return response?.data || response
}

///////// Conditions ////////////
export const GetConditions = async () => {
    const response = await axiosGet('/api/conditions/')
    return response?.data || response || []
}

export const CreateCondition = async (data) => {
    const response = await axiosPost('/api/conditions/', data)
    return response?.data || response
}

///////// Variables ////////////
export const GetVariables = async (projectId = null) => {
    const url = projectId ? `/api/variables/?project=${projectId}` : '/api/variables/'
    const response = await axiosGet(url)
    return response?.data || response || []
}

///////// Project Filters ////////////
// Note: Project filter API endpoints not available yet
// export const GetProjectFilters = async (projectId) => {
//     const response = await axiosGet(`/api/projects/${projectId}/filters/`)
//     return response?.data || response || []
// }

// export const CreateProjectFilter = async (projectId, data) => {
//     const response = await axiosPost(`/api/projects/${projectId}/filters/`, data)
//     return response?.data || response
// }

///////// Answers ////////////
export const GetAnswers = async () => {
    const response = await axiosGet('/api/answers/')
    return response?.data || response || []
}

export const SubmitAnswer = async (data) => {
    const response = await axiosPost('/api/answers/', data)
    return response?.data || response
}

///////// Next Question ////////////
export const CalculateNextQuestion = async (data) => {
    const response = await axiosPost('/api/next-question/', data)
    return response?.data || response
}

///////// Questions ////////////
export const GetQuestions = async (projectId) => {
    const response = await axiosGet(`/api/questions/?project=${projectId}`)
    return response?.data || response || []
}

export const GetQuestionById = async (questionId) => {
    const response = await axiosGet(`/api/questions/${questionId}/`)
    return response?.data || response
}

export const CreateQuestion = async (data) => {
    const response = await axiosPost('/api/questions/', data)
    return response?.data || response
}

export const UpdateQuestion = async (questionId, data) => {
    const response = await axiosPut(`/api/questions/${questionId}/`, data)
    return response?.data || response
}

export const DeleteQuestion = async (questionId) => {
    const response = await axiosDelete(`/api/questions/${questionId}/`)
    return response?.data || response
}

export const GetQuestionChoices = async (questionId) => {
    const response = await axiosGet(`/api/questions/${questionId}/choices/`)
    return response?.data || response || []
}

///////// Question Groups ////////////
export const GetQuestionGroups = async (projectId) => {
    const response = await axiosGet(`/api/question-groups/?project=${projectId}`)
    return response?.data || response || []
}

export const CreateQuestionGroup = async (data) => {
    const response = await axiosPost('/api/question-groups/', data)
    return response?.data || response
}

///////// Question Choices ////////////
export const GetQuestionChoicesList = async () => {
    const response = await axiosGet('/api/question-choices/')
    return response?.data || response || []
}

export const CreateQuestionChoice = async (data) => {
    const response = await axiosPost('/api/question-choices/', data)
    return response?.data || response
}

///////// Question Types ////////////
export const GetQuestionTypes = async () => {
    const response = await axiosGet('/api/questions/question-types/')
    return response?.data || response || []
}