import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Atenção", "Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert("Erro ao entrar", (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>✅ Taskly</Text>
        <Text style={styles.subtitle}>Seu gerenciador de tarefas</Text>

        <View style={styles.card}>
          <Input
            label="E-mail"
            placeholder="seu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Senha"
            placeholder="••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Entrar" onPress={handleLogin} loading={loading} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>
            Não tem conta? <Text style={styles.linkBold}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logo: {
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    color: colors.primary,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: colors.textMuted,
    marginBottom: 32,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  link: {
    textAlign: "center",
    marginTop: 24,
    color: colors.textMuted,
    fontSize: 15,
  },
  linkBold: { color: colors.primary, fontWeight: "700" },
});
