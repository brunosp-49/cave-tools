import { Platform } from "react-native";
import { getDefaultStore } from 'jotai';
import { PERMISSIONS, check, RESULTS, request } from "react-native-permissions";
import { api } from "../api";

export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? true : false;
};

export const validatePassword = (password: string) => {
  return password.length >= 8;
};

export const validatePasswordsMatch = (
  password: string,
  confirmPassword: string
) => {
  return password === confirmPassword;
};

export const validateCnpj = (cnpj: string) => {
  const re = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
  return re.test(cnpj) ? true : false;
};

export const applyCnpjMask = (value: string): string => {
  return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

export const checkIfIsBlank = (value: string) => {
  return value.trim() === "";
};

export const formatDate = (date: string): string => {
  try {
    const [year, month, day] = date.split("T")[0].split("-");
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    if (isNaN(parsedDate.getTime())) {
      return "Data inválida";
    }

    return parsedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Erro na data";
  }
};

export const requestPermissions = async () => {
  try {
    let cameraGranted = false;
    let locationGranted = false;

    if (Platform.OS === "ios") {
      check(PERMISSIONS.IOS.CAMERA)
        .then((result) => {
          if (result !== RESULTS.GRANTED) {
              request(PERMISSIONS.IOS.CAMERA)
                .then((result) => {
                  cameraGranted = true;
                })
                .catch((err) => {});
          }
        })
        .catch((err) => {});

      check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        .then((result) => {
          if (result !== RESULTS.GRANTED) {
              request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
                .then((result) => {
                  locationGranted = true;
                })
                .catch((err) => {});
          }
        })
        .catch((err) => {});
    } else {
      check(PERMISSIONS.ANDROID.CAMERA)
        .then((result) => {
          if (result !== RESULTS.GRANTED) {
              request(PERMISSIONS.ANDROID.CAMERA)
                .then((result) => {
                  cameraGranted = true;
                })
                .catch((err) => {
                  console.log({ err });
                });
          }
        })
        .catch((err) => {
            console.log({ err });
        });

      check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        .then((result) => {
          if (result !== RESULTS.GRANTED) {
            if (!locationGranted) {
              request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
                .then((result) => {
                  locationGranted = true;
                })
                .catch((err) => {});
            }
          }
        })
        .catch((err) => {});
    }
  } catch (err) {}
};

export const isTokenExpired = (lastLoginDate: string): boolean => {
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const now = new Date();
  const lastLogin = new Date(lastLoginDate);
  return now.getTime() - lastLogin.getTime() > oneDayInMs;
};

export const refreshUserToken = async (refresh_token: string) => {
  try {
    const response = await api.post("/token/refresh/", {
      refresh: refresh_token,
    });

    return response.data;
  } catch (error: any) {
    console.error("Failed to refresh token:", error?.message);
    throw error;
  }
};

export const isTokenAlmostExpired = (lastLogin: string, daysLimit = 30): boolean => {
  const lastLoginDate = new Date(lastLogin);
  const now = new Date();
  const diffInMs = now.getTime() - lastLoginDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return diffInDays >= daysLimit / 2 && diffInDays < daysLimit;
};


export const getDaysUntilExpiration = (lastLogin: string, daysLimit = 30): number => {
  const lastLoginDate = new Date(lastLogin);
  const expirationDate = new Date(lastLoginDate);
  expirationDate.setDate(expirationDate.getDate() + daysLimit);

  const now = new Date();
  const diffInMs = expirationDate.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays;
};

export function formatDateToInput(dateString: string) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export const requestLocationPermissions = async () => {
  if (Platform.OS === 'ios') {
    const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
  }

  if (Platform.OS === 'android') {
    const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
  }
};