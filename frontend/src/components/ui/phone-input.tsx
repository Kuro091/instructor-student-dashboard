import * as React from "react"
import PhoneInput from "react-phone-number-input"
import { cn } from "@/lib/utils"
import "react-phone-number-input/style.css"

interface PhoneInputProps {
  value?: string
  onChange?: (value: string | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function PhoneInputComponent({
  value,
  onChange = () => {},
  placeholder = "Enter phone number",
  className,
  disabled,
  ...props
}: PhoneInputProps) {
  return (
    <PhoneInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      international
      defaultCountry="US"
      className={cn(
        "flex bg-transparent file:bg-transparent disabled:opacity-50 shadow-sm px-3 py-1 border border-input file:border-0 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full h-9 file:font-medium placeholder:text-muted-foreground text-sm file:text-sm transition-colors disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}
