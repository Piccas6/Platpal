import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export function TagsSelector({ tags, selectedTags, onTagsChange, title = "FILTROS" }) {
  const selectedsContainerRef = useRef(null);

  const removeSelectedTag = (id) => {
    onTagsChange(selectedTags.filter((tagId) => tagId !== id));
  };

  const addSelectedTag = (id) => {
    onTagsChange([...selectedTags, id]);
  };

  useEffect(() => {
    if (selectedsContainerRef.current) {
      selectedsContainerRef.current.scrollTo({
        left: selectedsContainerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [selectedTags]);

  const selectedTagsData = tags.filter((tag) => selectedTags.includes(tag.id));
  const availableTags = tags.filter((tag) => !selectedTags.includes(tag.id));

  return (
    <div className="w-full flex flex-col">
      <motion.h3 layout className="text-sm font-semibold text-gray-700 mb-2">
        {title}
      </motion.h3>
      <motion.div
        className="w-full flex items-center justify-start gap-1.5 bg-emerald-50 border-2 border-emerald-200 h-14 mb-3 overflow-x-auto p-1.5 no-scrollbar"
        style={{
          borderRadius: 16,
        }}
        ref={selectedsContainerRef}
        layout
      >
        {selectedTagsData.length === 0 && (
          <span className="text-sm text-gray-400 px-2">Selecciona filtros...</span>
        )}
        {selectedTagsData.map((tag) => (
          <motion.div
            key={tag.id}
            className="flex items-center gap-1 pl-3 pr-1 py-1 bg-white shadow-md border-2 border-emerald-300 h-full shrink-0"
            style={{
              borderRadius: 14,
            }}
            layoutId={`tag-${tag.id}`}
          >
            <motion.span
              layoutId={`tag-${tag.id}-label`}
              className="text-emerald-700 font-medium text-sm"
            >
              {tag.icon} {tag.label}
            </motion.span>
            <button
              onClick={() => removeSelectedTag(tag.id)}
              className="p-1 rounded-full hover:bg-red-50"
            >
              <X className="size-4 text-red-500" />
            </button>
          </motion.div>
        ))}
      </motion.div>
      {availableTags.length > 0 && (
        <motion.div
          className="bg-white shadow-sm p-2 border-2 border-gray-200 w-full"
          style={{
            borderRadius: 16,
          }}
          layout
        >
          <motion.div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <motion.button
                key={tag.id}
                layoutId={`tag-${tag.id}`}
                className="flex items-center gap-1 px-4 py-2.5 bg-gray-100/60 hover:bg-emerald-100 hover:border-emerald-300 border-2 border-transparent rounded-full shrink-0 transition-colors"
                onClick={() => addSelectedTag(tag.id)}
                style={{
                  borderRadius: 14,
                }}
              >
                <motion.span
                  layoutId={`tag-${tag.id}-label`}
                  className="text-gray-700 font-medium text-sm"
                >
                  {tag.icon} {tag.label}
                </motion.span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}