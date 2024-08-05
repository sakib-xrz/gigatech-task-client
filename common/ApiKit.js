import HttpKit from "./HttpKit";

const { client } = HttpKit;

const defaultFileUploadConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

const ApiKit = {
  auth: {
    register: (payload) => {
      const url = "/auth/register";
      return client.post(url, payload);
    },
    login: (payload) => {
      const url = "/auth/login";
      return client.post(url, payload);
    },
  },

  user: {
    getMe: () => {
      const url = "users/me";
      return client.get(url);
    },
    getUsers: (params) => {
      const url = "/users";
      return client.get(url, { params });
    },
  },

  appointment: {
    getAppointments: (params) => {
      const url = "/appointments";
      return client.get(url, { params });
    },
    createAppointment: (payload) => {
      const url = "/appointments";
      return client.post(url, payload);
    },
    cancelAppointment: (appointmentId) => {
      const url = `/appointments/${appointmentId}/cancel`;
      return client.delete(url);
    },
  },
};

export default ApiKit;
