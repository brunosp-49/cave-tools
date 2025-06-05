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

export const formatDate = (dateString: string): string => {
  try {
    // Log the incoming date string for debugging
    console.log("Input date string:", dateString);

    // Step 1: Split the input string assuming "DD/MM/YYYY" format
    const parts = dateString.split("/");
    if (parts.length !== 3) {
      console.error("Invalid date format. Expected DD/MM/YYYY. Received:", dateString);
      return "Formato de data inválido"; // More specific error
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // Month from input is 1-indexed (e.g., 1 for January)
    const year = parseInt(parts[2], 10);

    // Basic validation for parsed numbers
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.error("Invalid date components after parsing. Input:", dateString);
      return "Componentes da data inválidos";
    }

    // Step 2: Create a Date object.
    // Note: The month for the JavaScript Date constructor is 0-indexed (0 for January, 1 for February, etc.)
    const parsedDate = new Date(year, month - 1, day);

    // Step 3: Validate the created date.
    // This checks if the date is a valid calendar date (e.g., not Feb 30)
    // and also ensures the Date constructor didn't roll over months/years due to invalid day/month.
    if (
      isNaN(parsedDate.getTime()) ||       // Check if it's an "Invalid Date"
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      console.error("Date components do not form a valid calendar date. Input:", dateString);
      return "Data inválida";
    }

    // Step 4: Format the valid Date object to the desired "pt-BR" locale string
    return parsedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",  // "long" gives "junho", "numeric" would give "06"
      year: "numeric",
    });

  } catch (e) {
    // Catch any other unexpected errors during the process
    console.error("Unexpected error formatting date:", dateString, e);
    return "Erro ao formatar data";
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