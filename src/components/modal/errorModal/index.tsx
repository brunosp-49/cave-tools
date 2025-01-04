import { Modal, View, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../../../assets/colors";
import TextInter from "../../textInter";
import { Divider } from "../../divider";
import ErrorIllustration from "../../icons/errorIllustration";
import { LongButton } from "../../longButton";
import { hideError } from "../../../redux/loadingSlice";

export const ErrorModal = () => {
    const { hasError, errorTitle, errorMessage } = useSelector(
        (state: {
            loading: {
                hasError: boolean;
                errorTitle: string;
                errorMessage: string;
            };
        }) => state.loading
    );
    const dispatch = useDispatch();

    return (
        <Modal visible={hasError} transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <TextInter color={colors.white[100]} fontSize={23} style={styles.title}>
                        {errorTitle}
                    </TextInter>
                    <Divider height={16} />
                    <ErrorIllustration />
                    <Divider height={16} />
                    <TextInter color={colors.dark[20]} weight="regular" style={styles.message}>
                        {errorMessage}
                    </TextInter>
                    <Divider />
                    <LongButton title="Fechar" onPress={() => dispatch(hideError())} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: "rgba(0,0,0,0.5)",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    modalContainer: {
        backgroundColor: colors.dark[30],
        width: "90%",
        height: "auto",
        minHeight: 250,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 30,
    },
    title: {
        textAlign: "center",
    },
    message: {
        textAlign: "center",
    },
});
