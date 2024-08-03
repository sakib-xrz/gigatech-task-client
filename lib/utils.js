import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import HttpKit from "@/common/HttpKit";
import { AUTH_TOKEN_KEY } from "./keyChain";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function deferred() {
  let _deferred = {};
  _deferred.promise = new Promise(function (resolve, reject) {
    _deferred.resolve = resolve;
    _deferred.reject = reject;
  });
  return _deferred;
}

export const setTokenAndRedirect = async (token, redirect = () => {}) => {
  try {
    const client = await HttpKit.setClientToken(token);
    const authToken =
      client.defaults.headers.common["Authorization"].split(" ")[1];
    localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    HttpKit.defer.resolve(client);
    redirect();
  } catch (error) {
    console.error(error);
  }
};

export function generateQueryString(params) {
  const isEmpty = Object.values(params).every((value) => value === "");

  if (isEmpty) {
    return "";
  }

  const queryString = Object.entries(params)
    .filter(([key, value]) => value !== "")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");

  return `?${queryString}`;
}

export function sanitizeParams(params) {
  const sanitizedObj = {};

  for (const key in params) {
    if (params[key]) {
      sanitizedObj[key] = params[key];
    }
  }

  return sanitizedObj;
}

export const formatText = (text) => {
  if (text) {
    const textLowerCase = text.split("_").join(" ").toLowerCase();
    const formattedText =
      textLowerCase.charAt(0).toUpperCase() + textLowerCase.slice(1);
    return formattedText;
  } else {
    return "";
  }
};
