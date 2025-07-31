import * as React from "react"
import { Input } from "./input"
import { formatTime, getTimeParts, isValidTime, timeToMinutes } from "./time-picker-utils"

export type TimeValue = number | null

interface TimePickerInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: TimeValue
  onChange: (value: TimeValue) => void
}

const TimePickerInput = React.forwardRef<HTMLInputElement, TimePickerInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const [stringValue, setStringValue] = React.useState(() => {
      return value ? formatTime(value) : ""
    })

    React.useEffect(() => {
      setStringValue(value ? formatTime(value) : "")
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      setStringValue(inputValue)

      if (!inputValue) {
        onChange(null)
        return
      }

      const [hoursStr, minutesStr] = inputValue.split(":")
      const hours = parseInt(hoursStr, 10)
      const minutes = parseInt(minutesStr, 10)

      const timeValue = timeToMinutes(hours, minutes)

      if (isValidTime(timeValue)) {
        onChange(timeValue)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault()
        if (!value) return

        const { hours, minutes } = getTimeParts(value)
        let newValue: TimeValue = null

        if (e.key === "ArrowUp") {
          newValue = timeToMinutes(hours, minutes + 15)
        } else {
          newValue = timeToMinutes(hours, minutes - 15)
        }

        if (isValidTime(newValue)) {
          onChange(newValue)
        }
      }
    }

    return (
      <Input
        ref={ref}
        type="time"
        step={900} // 15 minutes
        value={stringValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={className}
        {...props}
      />
    )
  }
)

TimePickerInput.displayName = "TimePickerInput"

export { TimePickerInput }