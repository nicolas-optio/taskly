import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📋</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 60 },
  emoji: { fontSize: 48, marginBottom: 12 },
  text: { fontSize: 15, color: colors.textMuted, textAlign: "center" },
});
