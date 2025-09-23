import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatPhoneNumber = (phoneNumber) => {
  if (phoneNumber.startsWith("0")) {
    return `234${phoneNumber.slice(1)}`;
  }
  return phoneNumber;
};
