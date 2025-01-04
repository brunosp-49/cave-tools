import { Platform } from "react-native";
import { PERMISSIONS, check, RESULTS, request } from "react-native-permissions";

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

export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }

  const formatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
    date
  );
  const year = date.getFullYear();
  const day = date.getDate();

  return `${day} de ${monthName}, ${year}`;
}

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
