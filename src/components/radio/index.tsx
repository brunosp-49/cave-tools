import React, { ReactNode, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../assets/colors";
import CheckedRadio from "../icons/checkedRadio";
import UncheckedRadio from "../icons/uncheckedRadio";
import TextInter from "../textInter";

interface RadioButtonProps {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  selected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={styles.radioButton}
      onPress={() => onSelect(value)}
    >
      {selected ? <CheckedRadio /> : <UncheckedRadio />}
      <View style={styles.labelContainer}>
        <TextInter color={colors.dark[60]}>{label}</TextInter>
      </View>
    </TouchableOpacity>
  );
};

interface RadioButtonGroupProps {
  options: { label: string; value: string; id: string; children?: ReactNode }[];
  value: string | null;
  onValueChange: (value: string) => void;
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  options,
  value,
  onValueChange,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(value);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onValueChange(value);
  };

  return (
    <View>
      {options.map((option) => (
        <View key={option.id}>
          <RadioButton
            label={option.label}
            value={option.value}
            selected={selectedValue === option.value}
            onSelect={handleSelect}
          />
          {option.children && option.children}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  labelContainer: {
    marginLeft: 10,
  },
});

export default RadioButtonGroup;
