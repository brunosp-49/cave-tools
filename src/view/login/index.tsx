import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  // Add ActivityIndicator if desired while checking user
  ActivityIndicator,
} from "react-native";
import { colors } from "../../assets/colors";
import { StatusBar } from "expo-status-bar";
import { Header } from "../../components/header";
import { Input } from "../../components/input";
import { LongButton } from "../../components/longButton";
import TextInter from "../../components/textInter";
import { FC, useLayoutEffect, useState, useCallback } from "react"; // Added useCallback
import { RouterProps } from "../../types";
import { createUser, fetchAllUsers } from "../../db/controller";
import { api } from "../../api";
import { useDispatch } from "react-redux";
import {
  resetLoadingState,
  setIsCheckingLoading,
  showError,
} from "../../redux/loadingSlice";
import NetInfo from "@react-native-community/netinfo";
// Remove useKeyboard if not used after removing testDone logic
// import useKeyboard from "../../hook";
import {
  CommonActions,
  useFocusEffect,
  useIsFocused,
} from "@react-navigation/native"; // Import useFocusEffect

export const Login: FC<RouterProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // For API call loading
  const [checkingUser, setCheckingUser] = useState(true); // NEW: To show loading indicator initially
  const [offline, setOffline] = useState(false);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  // --- Check Connectivity ---
  // useCallback helps prevent unnecessary re-creation of this function
  const checkConnection = useCallback(
    async (showErrorMsg = false) => {
      try {
        const state = await NetInfo.fetch();
        const isConnected = state.isConnected ?? false;
        setOffline(!isConnected); // Update state based on connection
        if (!isConnected && showErrorMsg) {
          dispatch(
            showError({
              title: "Aparelho desconectado",
              message: "Verifique sua conexão com a internet para continuar.",
            })
          );
        }
        return isConnected;
      } catch (error) {
        console.error("NetInfo error:", error);
        setOffline(true); // Assume offline on error
        if (showErrorMsg) {
          dispatch(
            showError({
              title: "Erro de conexão",
              message: "Não foi possível verificar a conexão.",
            })
          );
        }
        return false;
      }
    },
    [dispatch]
  ); // dispatch is a stable dependency

  // --- Handle Login Attempt ---
  const handleLogin = async () => {
    const isConnected = await checkConnection(true); // Check connection first, show error if offline
    if (!isConnected) {
      return; // Don't attempt login if offline
    }

    setLoading(true);
    api
      .post("/token/", {
        username: email,
        password: password,
      })
      .then((response) => {
        if (
          response.status === 200 &&
          response.data?.access &&
          response.data?.refresh
        ) {
          const loginTime = String(new Date());
          createUser({
            user_id: "2",
            refresh_token: response.data.refresh,
            token: response.data.access,
            last_login_date: loginTime,
            user_name: response.data.nome,
          })
            .then(() => {
              dispatch(resetLoadingState());
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "HomeScreen" }],
                })
              );
              dispatch(setIsCheckingLoading(true));
            })
            .catch((dbError) => {
              console.error("Failed to save user to DB:", dbError);
              dispatch(
                showError({
                  title: "Erro Local",
                  message:
                    "Não foi possível salvar seus dados. Tente novamente.",
                })
              );
            });
        } else {
          console.warn("Unexpected login response:", response);
          dispatch(
            showError({
              title: "Erro ao fazer login",
              message: "Resposta inesperada do servidor.",
            })
          );
        }
      })
      .catch((error) => {
        console.log("Login API error:", error.response?.data || error.message);
        let errorMessage = "Email ou senha inválidos";
        if (error.response?.status >= 500) {
          errorMessage = "Erro no servidor. Tente novamente mais tarde.";
        } else if (!error.response) {
          // Network error or server unreachable
          errorMessage = "Não foi possível conectar ao servidor.";
          setOffline(true); // Assume offline if request fails without response
        }
        dispatch(
          showError({
            title: "Erro ao fazer login",
            message: errorMessage,
          })
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // --- Initial Check for Existing User ---
  // useLayoutEffect runs synchronously after DOM mutations but before paint.
  // Good for navigating away early if user exists.
  useLayoutEffect(() => {
    if (!isFocused) return;
    console.log('isFocused', isFocused)
    let isMounted = true; // Prevent state updates if unmounted quickly
    console.log("Login: useLayoutEffect - Checking for existing user...");
    fetchAllUsers()
      .then((response) => {
        if (isMounted) {
          if (response.length > 0) {
            console.log("Login: User found locally, navigating to Tabs.");
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "HomeScreen" }],
              })
            );
            setCheckingUser(false);
          } else {
            console.log("Login: No local user found. Will show login form.");
            setCheckingUser(false); // Allow login form to render
            checkConnection(); // Check connection status for UI feedback (button state)
          }
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error("Login: Error fetching users:", error);
          setCheckingUser(false); // Allow login form to render even if check fails
          checkConnection(); // Check connection status
        }
      });

    return () => {
      isMounted = false;
    }; // Cleanup on unmount
  }, [navigation, checkConnection, isFocused]); // Add dependencies

  // --- Reset Fields on Focus ---
  // Ensures fields are clear when navigating back after logout
  useFocusEffect(
    useCallback(() => {
      console.log(
        "Login: Screen focused - Resetting fields and checking connection."
      );
      setEmail("");
      setPassword("");
      setLoading(false);
      setOffline(false); // Assume online initially on focus
      // If we are not checking user anymore (meaning form should be visible), check connection again
      if (!checkingUser) {
        checkConnection();
      }
      // If checkingUser is true, useLayoutEffect's checkConnection will handle it.
    }, [checkingUser, checkConnection]) // Add dependencies
  );

  // Disable button if fields are invalid, loading, or offline
  const isLoginDisabled =
    email.length < 5 || password.length < 5 || loading || offline;

  // --- Render ---
  // Show loading indicator while checking for existing user
  if (checkingUser) {
    return (
      <SafeAreaView style={styles.main}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white[100]} />
        </View>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  // Show Login form
  return (
    <SafeAreaView style={styles.main}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Content is now rendered directly, no !testDone check */}
          <>
            <Header title="Login" disableRightMenu disableReturn />

            {/* Optional: Show an offline indicator banner */}
            {offline && (
              <View style={styles.offlineIndicator}>
                <TextInter color={colors.error[100]} weight="medium">
                  Sem conexão com a internet
                </TextInter>
              </View>
            )}

            <View style={styles.body}>
              <Input
                placeholder="Digite seu email"
                label="E-mail"
                disabled={loading} // Only disable during API call
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize
              />
              <Input
                placeholder="Digite sua senha"
                label="Senha"
                disabled={loading} // Only disable during API call
                RightLinkIsActive // Keep as is unless logic changes
                value={password}
                onChangeText={setPassword}
                RightLinkText="Esqueceu sua senha?"
                secureTextEntry
                autoCapitalize
                // Add onPress handler to RightLinkText if needed
              />
              <LongButton
                title="Entrar"
                isLoading={loading}
                onPress={handleLogin}
                // Disable button if fields invalid OR loading OR offline
                disabled={isLoginDisabled}
              />
              {/* Inform user why button is disabled if offline */}
              {offline && !loading && (
                <TextInter color={colors.dark[20]} style={{ marginTop: 10 }}>
                  Login indisponível offline.
                </TextInter>
              )}
            </View>
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.footerText}
                // Disable registration link if offline too? Or allow navigating? Your choice.
                // Here, disabling if offline or loading.
                disabled={offline || loading}
                onPress={() => navigation.navigate("Register")}
              >
                <TextInter
                  color={
                    offline || loading ? colors.dark[60] : colors.white[100]
                  } // Grey out text when disabled
                  weight="medium"
                  fontSize={13}
                >
                  Não tem cadastro?{" "}
                </TextInter>
                <TextInter
                  color={
                    offline || loading ? colors.dark[60] : colors.accent[100]
                  } // Grey out text when disabled
                  weight="medium"
                  fontSize={13}
                >
                  Criar agora
                </TextInter>
              </TouchableOpacity>
            </View>
          </>
          <StatusBar style="light" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  body: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 99,
  },
  footer: {
    width: "100%",
    height: 58,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.dark[90],
  },
  offlineIndicator: {
    backgroundColor: "#444", // Provide fallback
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
  },
});
