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

export const formatDate = (dateInput: string | Date | null | undefined): string => {
  // Step 1: Handle null, undefined, or if the input is already a valid Date object
  if (!dateInput) {
    return "Data não fornecida";
  }

  if (dateInput instanceof Date) {
    // If it's already a Date object, just check if it's valid and format it.
    if (isNaN(dateInput.getTime())) {
      return "Data inválida";
    }
    return dateInput.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  try {
    const dateString = String(dateInput); // Ensure we're working with a string
    let day: number, month: number, year: number;

    // Step 2: Detect the format and parse the components
    if (dateString.includes('-')) {
      // Assumes "YYYY-MM-DD" or a full ISO string like "YYYY-MM-DDTHH:mm:ss..."
      const datePart = dateString.split("T")[0]; // Isolate the date part from a full ISO string
      const parts = datePart.split("-");

      if (parts.length !== 3) {
        throw new Error("Invalid YYYY-MM-DD format");
      }

      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10); // Month is 1-indexed
      day = parseInt(parts[2], 10);

    } else if (dateString.includes('/')) {
      // Assumes "DD/MM/YYYY" format
      const parts = dateString.split("/");
      if (parts.length !== 3) {
        throw new Error("Invalid DD/MM/YYYY format");
      }

      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10); // Month is 1-indexed
      year = parseInt(parts[2], 10);

    } else {
      // Fallback for other formats that new Date() might understand (e.g., timestamps)
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Unrecognized date format");
      }
      // If the fallback was successful, we can format and return directly
      return parsedDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }

    // Step 3: Centralized validation for the parsed components
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error("Date components are not valid numbers");
    }

    // The month for the JavaScript Date constructor is 0-indexed (0=Jan, 1=Feb, etc.)
    const parsedDate = new Date(year, month - 1, day);

    // This final check ensures the date is a real calendar date (e.g., not April 31)
    // and that the Date constructor didn't "roll over" an invalid date.
    if (
      isNaN(parsedDate.getTime()) ||
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      throw new Error("Date components do not form a valid calendar date");
    }

    // Step 4: Format the valid Date object to the desired locale string
    return parsedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  } catch (e: any) {
    console.error(`Error formatting date input: "${dateInput}". Error: ${e.message}`);
    return "Data inválida"; // Return a generic error for any failure
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

export function convertDdMmYyyyToYyyyMmDd(dateString: string): string {
  const dateParts = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!dateParts) {
    console.error("Invalid date format. Expected dd/mm/yyyy.");
    return "";
  }

  const day = dateParts[1];
  const month = dateParts[2];
  const year = dateParts[3];

  return `${year}-${month}-${day}`;
}