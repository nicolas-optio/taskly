import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius } from "../theme";

interface Props {
  label: string;
  active?: boolean;
  color?: string;
  onPress: () => void;
}

/** Chip de seleção usado em filtros, prioridade e categorias */
export function Chip({ label, active, color, onPress }: Props) {
  const accent = color ?? colors.primary;
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        active && { backgroundColor: accent, borderColor: accent },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {color ? (
        <View
          style={[styles.dot, { backgroundColor: active ? "#fff" : color }]}
        />
      ) : null}
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  label: { fontSize: 14, color: colors.textMuted, fontWeight: "500" },
  labelActive: { color: "#fff" },
});
