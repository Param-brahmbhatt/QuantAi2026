import { axiosDelete, axiosGet, axiosPatch, axiosPost, axiosPut } from "../Handler/handler"


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
export const UpdateProject = async () => {
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
export const UpdateRole = async (id, data) => {
    const response = await axiosPatch(
        `/api/users/admin/users/${id}/`,
        data
    );
    return response.data;
};


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
    // Log the exact payload being sent
    console.log("🔍 CREATE QUESTION REQUEST:", {
        url: "/api/questions/",
        method: "POST",
        payload: JSON.stringify(data, null, 2)
    });
    const response = await axiosPost('/api/questions/', data)
    // Log the exact response received
    console.log("🔍 CREATE QUESTION RESPONSE:", {
        status: "success",
        data: JSON.stringify(response?.data || response, null, 2)
    });
    return response?.data || response
}

export const UpdateQuestion = async (questionId, data) => {
    // Log the exact payload being sent
    console.log("🔍 UPDATE QUESTION REQUEST:", {
        url: `/api/questions/${questionId}/`,
        method: "PUT",
        payload: JSON.stringify(data, null, 2)
    });
    const response = await axiosPut(`/api/questions/${questionId}/`, data)
    // Log the exact response received
    console.log("🔍 UPDATE QUESTION RESPONSE:", {
        status: "success",
        data: JSON.stringify(response?.data || response, null, 2)
    });
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

// NOTE: The backend structure:
//   GET  /api/questions/:questionId/choices/ - get choices for a question (nested)
//   GET  /api/question-choices/ - list all choices (flat)
//   POST /api/question-choices/ - create a choice (flat, requires question ID in body)
//   PUT/DELETE /api/question-choices/:id/ - update/delete a choice (flat)
export const CreateQuestionChoice = async (questionId, data) => {
    // Include question ID in the data payload for flat endpoint
    const choiceData = {
        ...data,
        question: questionId,
    };
    const response = await axiosPost('/api/question-choices/', choiceData)
    return response?.data || response
}

export const UpdateQuestionChoice = async (questionId, choiceId, data) => {
    // Include question ID in the data payload
    const choiceData = {
        ...data,
        question: questionId,
    };
    const response = await axiosPut(`/api/question-choices/${choiceId}/`, choiceData)
    return response?.data || response
}

export const DeleteQuestionChoice = async (questionId, choiceId) => {
    const response = await axiosDelete(`/api/question-choices/${choiceId}/`)
    return response?.data || response
}

///////// Question Types ////////////
export const GetQuestionTypes = async () => {
    const response = await axiosGet('/api/questions/question-types/')
    return response?.data || response || []
}