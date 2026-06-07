import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface Props {
  name: string;
  uri?: string | null;
  size?: number;
}

/** Avatar do usuário — exibe a foto armazenada no servidor ou as iniciais */
export function Avatar({ name, uri, size = 44 }: Props) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    return <Image source={{ uri }} style={style} />;
  }
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <View style={[styles.fallback, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { color: "#fff", fontWeight: "700" },
});
