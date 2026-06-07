import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { api, imageUrl } from "../api/client";
import { Avatar } from "../components/Avatar";
import { Chip } from "../components/Chip";
import { EmptyState } from "../components/EmptyState";
import { TaskCard } from "../components/TaskCard";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import type { Category, Task, TaskStatus } from "../types";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;
type StatusFilter = TaskStatus | "all";

export function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Busca tarefas na API (com filtros) — consumo das APIs do servidor Node
  const loadData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter) params.append("categoryId", String(categoryFilter));
      const qs = params.toString();
      const [taskList, categoryList] = await Promise.all([
        api.get<Task[]>(`/tasks${qs ? `?${qs}` : ""}`),
        api.get<Category[]>("/categories"),
      ]);
      setTasks(taskList);
      setCategories(categoryList);
    } catch (err) {
      Alert.alert("Erro", (err as Error).message);
    }
  }, [statusFilter, categoryFilter]);

  // Recarrega sempre que a tela ganha foco ou os filtros mudam
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleToggle(task: Task) {
    try {
      await api.patch(`/tasks/${task.id}/toggle`);
      await loadData();
    } catch (err) {
      Alert.alert("Erro", (err as Error).message);
    }
  }

  function handleDelete(task: Task) {
    Alert.alert("Excluir tarefa", `Deseja excluir "${task.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/tasks/${task.id}`);
            await loadData();
          } catch (err) {
            Alert.alert("Erro", (err as Error).message);
          }
        },
      },
    ]);
  }

  const pending = tasks.filter((t) => t.status === "pending").length;

  return (
    <View style={styles.container}>
      {/* Cabeçalho com avatar do usuário (imagem vinda do servidor) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar name={user?.name ?? "?"} uri={imageUrl(user?.avatarUrl)} />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              Olá, {user?.name?.split(" ")[0]} 👋
            </Text>
            <Text style={styles.counter}>
              {pending} tarefa{pending === 1 ? "" : "s"} pendente
              {pending === 1 ? "" : "s"}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros por status */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContent}
      >
        <Chip
          label="Todas"
          active={statusFilter === "all"}
          onPress={() => setStatusFilter("all")}
        />
        <Chip
          label="Pendentes"
          active={statusFilter === "pending"}
          onPress={() => setStatusFilter("pending")}
        />
        <Chip
          label="Concluídas"
          active={statusFilter === "done"}
          onPress={() => setStatusFilter("done")}
        />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            color={cat.color}
            active={categoryFilter === cat.id}
            onPress={() =>
              setCategoryFilter(categoryFilter === cat.id ? null : cat.id)
            }
          />
        ))}
      </ScrollView>

      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate("TaskForm", { task: item })}
            onToggle={() => handleToggle(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState message="Nenhuma tarefa por aqui.Toque em + para criar a primeira!" />
        }
      />

      {/* Botão flutuante de nova tarefa */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("TaskForm", {})}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerText: { marginLeft: 12 },
  greeting: { fontSize: 17, fontWeight: "700", color: colors.text },
  counter: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  logout: { color: colors.danger, fontWeight: "600", fontSize: 15 },
  filters: { maxHeight: 56, marginTop: 12 },
  filtersContent: { paddingHorizontal: 20, alignItems: "center" },
  list: { padding: 20, paddingBottom: 100 },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 32 },
});
