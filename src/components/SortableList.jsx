import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useLanguage } from '../i18n/LanguageContext'
import './SortableList.css'

function SortableItem({ item, itemClassName, renderItem }) {
  const { t } = useLanguage()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const handle = (
    <button
      type="button"
      className="drag-handle"
      aria-label={t('common.dragHandle')}
      title={t('common.dragHandle')}
      {...attributes}
      {...listeners}
    >
      ⋮⋮
    </button>
  )

  return (
    <li
      ref={setNodeRef}
      className={`${itemClassName ?? ''}${isDragging ? ' sortable-item--dragging' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {renderItem(item, handle)}
    </li>
  )
}

function SortableList({ items, onReorder, renderItem, className, itemClassName, grid = false }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const from = items.findIndex((item) => item.id === active.id)
    const to = items.findIndex((item) => item.id === over.id)
    if (from < 0 || to < 0) return
    onReorder(arrayMove(items, from, to))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={grid ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <ul className={className}>
          {items.map((item) => (
            <SortableItem key={item.id} item={item} itemClassName={itemClassName} renderItem={renderItem} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

export default SortableList
