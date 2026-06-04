import { cookies } from "next/headers";

import { DEFAULT_LOCALE, isLocale } from "./i18n";
import type { Locale } from "./types";

export const LOCALE_COOKIE = "lang";

export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
