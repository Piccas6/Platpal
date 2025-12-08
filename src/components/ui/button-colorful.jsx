import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function ButtonColorful({
    className,
    label = "Ver menús disponibles",
    icon: Icon = ArrowRight,
    ...props
}) {
    return (
        <Button
            className={cn(
                "relative h-auto px-10 sm:px-14 py-6 sm:py-7 overflow-hidden",
                "bg-emerald-600",
                "transition-all duration-200",
                "group",
                "rounded-full",
                "shadow-xl hover:shadow-2xl hover:scale-105",
                className
            )}
            {...props}
        >
            {/* Gradient background effect */}
            <div
                className={cn(
                    "absolute inset-0",
                    "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600",
                    "opacity-70 group-hover:opacity-100",
                    "transition-opacity duration-500"
                )}
            />

            {/* Content */}
            <div className="relative flex items-center justify-center gap-2">
                <span className="text-white text-base sm:text-lg font-bold">{label}</span>
                {Icon && <Icon className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />}
            </div>
        </Button>
    );
}