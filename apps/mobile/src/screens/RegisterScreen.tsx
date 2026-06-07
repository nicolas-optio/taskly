import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import type { PickedImage } from "../types";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<PickedImage | null>(null);
  const [loading, setLoading] = useState(false);

  // Seleciona a foto de perfil da galeria
  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAvatar({
        uri: asset.uri,
        name: asset.fileName ?? "avatar.jpg",
        type: asset.mimeType ?? "image/jpeg",
      });
    }
  }

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, avatar);
    } catch (err) {
      Alert.alert("Erro ao cadastrar", (err as Error).message);
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
        <Text style={styles.title}>Criar conta</Text>

        {/* Avatar (imagem enviada ao servidor) */}
        <TouchableOpacity style={styles.avatarPicker} onPress={pickAvatar}>
          {avatar ? (
            <Image source={{ uri: avatar.uri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarIcon}>📷</Text>
              <Text style={styles.avatarText}>Foto de perfil</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.card}>
          <Input
            label="Nome"
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
          />
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
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Cadastrar" onPress={handleRegister} loading={loading} />
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>
            Já tem conta? <Text style={styles.linkBold}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: colors.text,
    marginBottom: 20,
  },
  avatarPicker: { alignSelf: "center", marginBottom: 20 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: { fontSize: 22 },
  avatarText: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
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
