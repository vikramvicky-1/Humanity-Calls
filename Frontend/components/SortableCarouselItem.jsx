import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaBan, FaGripLines } from "react-icons/fa";

const SortableCarouselItem = ({ img, index, confirmDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-2xl overflow-hidden border border-border bg-white shadow-lg hover:shadow-2xl transition-all ${
        isDragging ? "shadow-2xl scale-105" : ""
      }`}
    >
      <div className="aspect-video relative">
        <img
          src={img.imageUrl}
          alt={`Carousel ${index + 1}`}
          className="w-full h-full object-cover pointer-events-none"
        />
        
        {/* Index Badge */}
        <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-10">
          {index + 1}
        </div>

        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-500 p-2 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:text-primary transition-all z-10"
          title="Drag to reorder"
        >
          <FaGripLines size={14} />
        </div>

        {/* Delete Overlay */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-all flex items-center justify-center gap-4">
          <button
            onClick={() => confirmDelete(img)}
            className="bg-blood/40 group-hover:bg-blood text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all border-2 border-white/20"
            title="Delete Image"
          >
            <FaBan size={22} className="drop-shadow-md" />
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-white flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Added on</p>
          <p className="text-sm font-medium text-gray-800">
            {new Date(img.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2.5 py-1 rounded-md">
          16:9 RATIO
        </span>
      </div>
    </div>
  );
};

export default SortableCarouselItem;
