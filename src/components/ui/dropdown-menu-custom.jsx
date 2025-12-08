import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const DropdownMenuCustom = ({ options, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        onClick={toggleDropdown}
        className="px-4 py-3 bg-white hover:bg-emerald-50 shadow-md border-2 border-emerald-200 hover:border-emerald-300 rounded-xl backdrop-blur-sm text-gray-900 w-full justify-between"
      >
        {children ?? "Seleccionar"}
        <motion.span
          className="ml-2"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut", type: "spring" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -5, scale: 0.95, filter: "blur(10px)" }}
            animate={{ y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ y: -5, scale: 0.95, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "circInOut", type: "spring" }}
            className="absolute z-50 w-full mt-2 p-1 bg-white rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] border-2 border-emerald-100 backdrop-blur-sm flex flex-col gap-2 max-h-[300px] overflow-y-auto"
          >
            {options && options.length > 0 ? (
              options.map((option, index) => (
                <motion.button
                  initial={{
                    opacity: 0,
                    x: 10,
                    scale: 0.95,
                    filter: "blur(10px)",
                  }}
                  animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    x: 10,
                    scale: 0.95,
                    filter: "blur(10px)",
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: "easeInOut",
                    type: "spring",
                  }}
                  whileHover={{
                    backgroundColor: "#ecfdf5",
                    transition: {
                      duration: 0.2,
                      ease: "easeInOut",
                    },
                  }}
                  whileTap={{
                    scale: 0.98,
                    transition: {
                      duration: 0.2,
                      ease: "easeInOut",
                    },
                  }}
                  key={option.value || option.label}
                  onClick={() => {
                    option.onClick();
                    setIsOpen(false);
                  }}
                  className="px-3 py-3 cursor-pointer text-gray-900 text-sm rounded-lg w-full text-left flex items-center gap-x-3 hover:bg-emerald-50"
                >
                  {option.Icon}
                  <div className="flex-1">
                    {option.content || option.label}
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-xs">No hay opciones</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { DropdownMenuCustom };