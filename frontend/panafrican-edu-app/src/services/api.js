// Configuration de l'API
const API_BASE_URL = 'http://localhost:5000/api';

// Utilitaire pour les requêtes HTTP
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Ajouter le token d'authentification si disponible
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur API');
    }

    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// Services d'authentification
export const authService = {
  login: async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  register: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  getProfile: async () => {
    return await apiRequest('/auth/profile');
  },

  updateProfile: async (profileData) => {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Services pour les questions
export const questionsService = {
  getQuestions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/questions?${queryString}`);
  },

  getQuestion: async (id) => {
    return await apiRequest(`/questions/${id}`);
  },

  createQuestion: async (questionData) => {
    return await apiRequest('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  createAnswer: async (questionId, answerData) => {
    return await apiRequest(`/questions/${questionId}/answers`, {
      method: 'POST',
      body: JSON.stringify(answerData),
    });
  },

  voteQuestion: async (questionId, voteType) => {
    return await apiRequest(`/questions/${questionId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type: voteType }),
    });
  },

  voteAnswer: async (answerId, voteType) => {
    return await apiRequest(`/answers/${answerId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type: voteType }),
    });
  },

  acceptAnswer: async (answerId) => {
    return await apiRequest(`/answers/${answerId}/accept`, {
      method: 'POST',
    });
  },
};

// Services pour les mentors
export const mentorsService = {
  getMentors: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/mentors?${queryString}`);
  },

  getMentor: async (id) => {
    return await apiRequest(`/mentors/${id}`);
  },

  becomeMentor: async (mentorData) => {
    return await apiRequest('/mentors/become', {
      method: 'POST',
      body: JSON.stringify(mentorData),
    });
  },

  requestMentorship: async (mentorId, requestData) => {
    return await apiRequest(`/mentors/${mentorId}/request`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  getMentorshipRequests: async () => {
    return await apiRequest('/mentorship/requests');
  },

  respondToRequest: async (requestId, response) => {
    return await apiRequest(`/mentorship/requests/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  },
};

// Services pour les badges et points
export const badgesService = {
  getBadges: async (category = '') => {
    const queryString = category ? `?category=${category}` : '';
    return await apiRequest(`/badges${queryString}`);
  },

  getUserBadges: async (userId) => {
    return await apiRequest(`/users/${userId}/badges`);
  },

  getUserPoints: async (userId) => {
    return await apiRequest(`/users/${userId}/points`);
  },

  getLeaderboard: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/leaderboard?${queryString}`);
  },

  addPoints: async (pointsData) => {
    return await apiRequest('/users/points/add', {
      method: 'POST',
      body: JSON.stringify(pointsData),
    });
  },
};

// Services pour les notifications
export const notificationsService = {
  getNotifications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/notifications?${queryString}`);
  },

  markAsRead: async (notificationId) => {
    return await apiRequest(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },

  markAllAsRead: async () => {
    return await apiRequest('/notifications/mark-all-read', {
      method: 'POST',
    });
  },
};

// Services pour les opportunités
export const opportunitiesService = {
  getOpportunities: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/opportunities?${queryString}`);
  },

  createOpportunity: async (opportunityData) => {
    return await apiRequest('/opportunities', {
      method: 'POST',
      body: JSON.stringify(opportunityData),
    });
  },
};

// Service générique pour les utilisateurs
export const usersService = {
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/users?${queryString}`);
  },

  getUser: async (id) => {
    return await apiRequest(`/users/${id}`);
  },
};

export default {
  auth: authService,
  questions: questionsService,
  mentors: mentorsService,
  badges: badgesService,
  notifications: notificationsService,
  opportunities: opportunitiesService,
  users: usersService,
};

