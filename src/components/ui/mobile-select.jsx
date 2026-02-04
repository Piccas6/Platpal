import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

/**
 * Mobile-responsive Select component that uses a native-style Drawer on mobile
 * and the standard Select component on desktop
 */
export function MobileSelect({ 
  value, 
  onValueChange, 
  options = [], 
  placeholder = "Select an option",
  label,
  triggerClassName,
  contentClassName 
}) {
  const [open, setOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName
          )}
        >
          <span className={selectedOption ? "" : "text-muted-foreground"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <DrawerContent className={cn("max-h-[80vh]", contentClassName)}>
          <DrawerHeader>
            <DrawerTitle>{label || placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-8">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "relative flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-accent",
                  value === option.value && "bg-accent"
                )}
              >
                <span className="font-medium">{option.label}</span>
                {value === option.value && (
                  <Check className="h-5 w-5 text-emerald-600" />
                )}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use standard Select
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}