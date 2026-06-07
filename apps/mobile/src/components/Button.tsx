import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { colors, radius } from "../theme";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "outline" | "danger";
}

export function Button({ title, onPress, loading, variant = "primary" }: Props) {
  const isOutline = variant === "outline";
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isOutline && styles.outline,
        variant === "danger" && { backgroundColor: colors.danger },
      ]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : "#fff"} />
      ) : (
        <Text style={[styles.label, isOutline && { color: colors.primary }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  label: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
