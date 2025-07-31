import { TimeValue } from "./time-picker-input"

export function getTimeParts(value: TimeValue) {
  if (!value) return { hours: 0, minutes: 0 }
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  return { hours, minutes }
}

export function formatTime(value: TimeValue) {
  const { hours, minutes } = getTimeParts(value)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

export function isValidTime(value: TimeValue): boolean {
  if (value === null || value === undefined) return false
  const { hours, minutes } = getTimeParts(value)
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60
}

export function timeToMinutes(hours: number, minutes: number): TimeValue {
  return hours * 60 + minutes
}