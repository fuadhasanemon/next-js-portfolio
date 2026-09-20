import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Row = ({ id, busy, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        borderColor: "rgb(var(--line) / 0.12)",
        opacity: isDragging ? 0.6 : 1,
        cursor: busy ? "progress" : undefined,
        zIndex: isDragging ? 10 : undefined,
        position: "relative",
      }}
      aria-busy={busy ? "true" : undefined}
      className={`flex items-center gap-3 rounded-xl border bg-bg p-3 transition-opacity duration-200 ${
        busy ? "opacity-60" : ""
      }`}
    >
      {/* Drag handle is separate so links and buttons in the row stay clickable. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={!!busy}
        aria-label="Reorder"
        className="shrink-0 cursor-grab touch-none rounded px-1.5 py-1 text-faint hover:text-ink active:cursor-grabbing"
      >
        ⠿
      </button>
      {children}
    </li>
  );
};

const SortableList = ({ items, onReorder, renderItem, busyIds = {} }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-2">
          {items.map((item) => (
            <Row key={item.id} id={item.id} busy={busyIds[item.id]}>
              {renderItem(item)}
            </Row>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

export default SortableList;
