import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { imageUrl } from "../api/client";
import { colors, priorityColors, priorityLabels, radius } from "../theme";
import type { Task } from "../types";

interface Props {
  task: Task;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === "done") return false;
  return task.dueDate < new Date().toISOString().slice(0, 10);
}

/** Card de tarefa — componentização + estilização */
export function TaskCard({ task, onPress, onToggle, onDelete }: Props) {
  const done = task.status === "done";
  const overdue = isOverdue(task);
  const img = imageUrl(task.imageUrl);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Checkbox de conclusão */}
      <TouchableOpacity
        style={[styles.checkbox, done && styles.checkboxDone]}
        onPress={onToggle}
      >
        {done && <Text style={styles.check}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        {task.description ? (
          <Text style={styles.description} numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles.meta}>
          <View
            style={[
              styles.badge,
              { backgroundColor: priorityColors[task.priority] + "22" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: priorityColors[task.priority] },
              ]}
            >
              {priorityLabels[task.priority]}
            </Text>
          </View>

          {task.categoryName ? (
            <View style={styles.category}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: task.categoryColor ?? colors.primary },
                ]}
              />
              <Text style={styles.categoryText}>{task.categoryName}</Text>
            </View>
          ) : null}

          {task.dueDate ? (
            <Text style={[styles.dueDate, overdue && styles.overdue]}>
              {overdue ? "⚠ " : "📅 "}
              {formatDate(task.dueDate)}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Imagem anexada à tarefa (armazenada no servidor) */}
      {img ? <Image source={{ uri: img }} style={styles.thumb} /> : null}

      <TouchableOpacity style={styles.delete} onPress={onDelete}>
        <Text style={styles.deleteText}>🗑</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  check: { color: "#fff", fontSize: 14, fontWeight: "700" },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: colors.text },
  titleDone: { textDecorationLine: "line-through", color: colors.textMuted },
  description: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  category: { flexDirection: "row", alignItems: "center" },
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  categoryText: { fontSize: 12, color: colors.textMuted },
  dueDate: { fontSize: 12, color: colors.textMuted },
  overdue: { color: colors.danger, fontWeight: "700" },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    marginLeft: 10,
  },
  delete: { marginLeft: 8, padding: 4 },
  deleteText: { fontSize: 16 },
});
