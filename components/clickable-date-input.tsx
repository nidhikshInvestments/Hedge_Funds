"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type InputProps = React.ComponentProps<'input'>

export function ClickableDateInput({ className, ...props }: InputProps) {
    return (
        <div className="relative">
            <Input
                type="date"
                style={{ colorScheme: "dark" }}
                className={cn(
                    "cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:scale-125",
                    className
                )}
                onClick={(e) => {
                    // Open the picker on click anywhere in the input
                    try {
                        if ("showPicker" in e.currentTarget) {
                            ; (e.currentTarget as HTMLInputElement).showPicker()
                        }
                    } catch (error) {
                        // Fallback or ignore if not supported
                    }
                }}
                {...props}
            />
        </div>
    )
}
