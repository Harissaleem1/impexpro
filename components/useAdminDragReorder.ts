"use client";

import type { DragEvent, Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type OrderedItem = { id: string; sortOrder?: number };

export function useAdminDragReorder<T extends OrderedItem>({
  items,
  setItems,
  endpoint,
  errorMessage,
  setError
}: {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  endpoint: string;
  errorMessage: string;
  setError: (message: string) => void;
}) {
  const router = useRouter();
  const [draggedId, setDraggedId] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);

  function dragStart(event: DragEvent, id: string) {
    if (savingOrder) return;
    setDraggedId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  async function drop(event: DragEvent, targetId: string) {
    event.preventDefault();
    const sourceId = draggedId || event.dataTransfer.getData("text/plain");
    setDraggedId("");
    if (!sourceId || sourceId === targetId || savingOrder) return;

    const sourceIndex = items.findIndex((item) => item.id === sourceId);
    const targetIndex = items.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const previous = items;
    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    const reordered = next.map((item, sortOrder) => ({ ...item, sortOrder }));

    setItems(reordered);
    setSavingOrder(true);
    setError("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((item) => item.id) })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setItems(previous);
        setError(data.error || errorMessage);
        return;
      }
      router.refresh();
    } catch {
      setItems(previous);
      setError(errorMessage);
    } finally {
      setSavingOrder(false);
    }
  }

  return {
    draggedId,
    savingOrder,
    rowProps: (id: string) => ({
      onDragOver: (event: DragEvent) => event.preventDefault(),
      onDrop: (event: DragEvent) => void drop(event, id),
      className: draggedId === id ? "admin-row-dragging" : undefined
    }),
    handleProps: (id: string) => ({
      draggable: !savingOrder,
      onDragStart: (event: DragEvent) => dragStart(event, id),
      onDragEnd: () => setDraggedId(""),
      "aria-label": "Drag to reorder"
    })
  };
}
