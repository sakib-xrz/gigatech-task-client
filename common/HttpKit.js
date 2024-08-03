import axios from "axios";

import { deferred } from "@/lib/utils";

let client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

const defer = new deferred();
let clientIsAuthenticated = false;

const setClientToken = (token) => {
  try {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    clientIsAuthenticated = true;
    defer.resolve(client);
  } catch (error) {
    console.log("Error from setClientToken", error);
    defer.reject(error);
  }
  return defer.promise;
};

const removeClientToken = () => {
  try {
    delete client.defaults.headers.common["Authorization"];
    clientIsAuthenticated = false;
    defer.reject("Token removed");
  } catch (error) {
    console.log("Error from removeClientToken", error);
    defer.reject(error);
  }
  return defer.promise;
};

client.interceptors.response.use(
  function (response) {
    const responseObject = {
      success: true,
      statusCode: response?.data?.statusCode || 200,
      message: response?.data?.message || "Request successful",
      meta: response?.data?.meta || null,
      data: response?.data?.result || response?.data,
    };
    return responseObject;
  },
  function (error) {
    const errorResponse = {
      success: false,
      message: error.response?.data?.message || "An error occurred",
      errorMessages: error.response?.data?.errorMessages || [],
    };
    return Promise.reject(errorResponse);
  }
);

const HttpKit = {
  defer,
  client,
  setClientToken,
  removeClientToken,
};

export default HttpKit;
