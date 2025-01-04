import { ActivityIndicator, Modal, View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { colors } from "../../../assets/colors";

export const LoadingModal = () => {
    const { isLoading } = useSelector(
        (state: { loading: { isLoading: boolean } }) => state.loading
    );

    return (
        <Modal transparent visible={isLoading}>
            <View style={styles.container}>
                <ActivityIndicator
                    size={80}
                    color={colors.opposite[100]}
                    animating={isLoading}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "rgba(0,0,0,0.5)",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
