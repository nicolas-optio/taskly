import React, { useEffect, useState } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { api, imageUrl } from "../api/client";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Input } from "../components/Input";
import { colors, priorityLabels, radius } from "../theme";
import type { Category, PickedImage, Priority, Task } from "../types";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "TaskForm">;

const PRIORITIES: Priority[] = ["low", "medium", "high"];

export function TaskFormScreen({ navigation, route }: Props) {
  const editing = route.params?.task;

  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [priority, setPriority] = useState<Priority>(
    editing?.priority ?? "medium"
  );
  const [dueDate, setDueDate] = useState<string | null>(
    editing?.dueDate ?? null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(
    editing?.categoryId ?? null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [image, setImage] = useState<PickedImage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<Category[]>("/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Seleciona a imagem anexada à tarefa
  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImage({
        uri: asset.uri,
        name: asset.fileName ?? "task.jpg",
        type: asset.mimeType ?? "image/jpeg",
      });
    }
  }

  async function createCategory() {
    if (!newCategory.trim()) return;
    try {
      const palette = ["#6366f1", "#f59e0b", "#22c55e", "#ef4444", "#06b6d4"];
      const created = await api.post<Category>("/categories", {
        name: newCategory.trim(),
        color: palette[categories.length % palette.length],
      });
      setCategories((prev) => [...prev, created]);
      setCategoryId(created.id);
      setNewCategory("");
    } catch (err) {
      Alert.alert("Erro", (err as Error).message);
    }
  }

  // Envia a tarefa para a API como multipart/form-data (texto + imagem)
  async function handleSave() {
    if (!title.trim()) {
      Alert.alert("Atenção", "Informe o título da tarefa.");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      if (description.trim()) form.append("description", description.trim());
      form.append("priority", priority);
      if (dueDate) form.append("dueDate", dueDate);
      if (categoryId) form.append("categoryId", String(categoryId));
      if (image) form.append("image", image as unknown as Blob);

      if (editing) {
        await api.putForm<Task>(`/tasks/${editing.id}`, form);
      } else {
        await api.postForm<Task>("/tasks", form);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert("Erro ao salvar", (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const previewUri = image?.uri ?? imageUrl(editing?.imageUrl);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Título *"
          placeholder="O que precisa ser feito?"
          value={title}
          onChangeText={setTitle}
        />
        <Input
          label="Descrição"
          placeholder="Detalhes da tarefa (opcional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        {/* Prioridade */}
        <Text style={styles.sectionLabel}>Prioridade</Text>
        <View style={styles.row}>
          {PRIORITIES.map((p) => (
            <Chip
              key={p}
              label={priorityLabels[p]}
              active={priority === p}
              onPress={() => setPriority(p)}
            />
          ))}
        </View>

        {/* Data de vencimento */}
        <Text style={styles.sectionLabel}>Data de vencimento</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {dueDate
                ? dueDate.split("-").reverse().join("/")
                : "Selecionar data 📅"}
            </Text>
          </TouchableOpacity>
          {dueDate ? (
            <TouchableOpacity onPress={() => setDueDate(null)}>
              <Text style={styles.clear}>Limpar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate ? new Date(`${dueDate}T12:00:00`) : new Date()}
            mode="date"
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setDueDate(date.toISOString().slice(0, 10));
            }}
          />
        )}

        {/* Categoria */}
        <Text style={styles.sectionLabel}>Categoria</Text>
        <View style={[styles.row, styles.wrap]}>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              color={cat.color}
              active={categoryId === cat.id}
              onPress={() =>
                setCategoryId(categoryId === cat.id ? null : cat.id)
              }
            />
          ))}
        </View>
        <View style={styles.newCategoryRow}>
          <View style={styles.flex}>
            <Input
              label="Nova categoria"
              placeholder="Ex.: Faculdade"
              value={newCategory}
              onChangeText={setNewCategory}
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={createCategory}>
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* Imagem anexada (armazenada no servidor e exibida no app) */}
        <Text style={styles.sectionLabel}>Imagem</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.preview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageIcon}>🖼️</Text>
              <Text style={styles.imageText}>Toque para anexar uma imagem</Text>
            </View>
          )}
        </TouchableOpacity>

        <Button
          title={editing ? "Salvar alterações" : "Criar tarefa"}
          onPress={handleSave}
          loading={loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  wrap: { flexWrap: "wrap", gap: 8 },
  dateButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateText: { fontSize: 15, color: colors.text },
  clear: { color: colors.danger, marginLeft: 12, fontWeight: "600" },
  newCategoryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  addButtonText: { color: "#fff", fontSize: 22, lineHeight: 26 },
  imagePicker: { marginBottom: 20 },
  preview: { width: "100%", height: 180, borderRadius: radius.lg },
  imagePlaceholder: {
    height: 120,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  imageIcon: { fontSize: 26 },
  imageText: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
