import koJson from "@lang/ko";
import enJson from "@lang/en";

export function getLangJson(): PlayerLangMap {
  const currentLang = document.documentElement.getAttribute("lang");

  if (currentLang === "ko")
    return koJson;

  return enJson;
}