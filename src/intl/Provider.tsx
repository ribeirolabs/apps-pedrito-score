import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Lang, TOKENS, Tokens } from "./translations";
import { getLocalStorage, setLocalStorage } from "@ribeirolabs/local-storage";

type Context = {
  lang: Lang;
  tokens: Tokens;
} | null;

const TranslationContext = createContext<Context>(null);

export function useTranslation() {
  const translation = useContext(TranslationContext);

  if (!translation) {
    throw new Error("Missing translation value from context");
  }

  const t = useCallback(
    (token: keyof Tokens) => {
      return translation.tokens[token];
    },
    [translation.tokens]
  );

  return {
    ...translation,
    t,
  };
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<Context>(null);

  useEffect(() => {
    let lang = (new URLSearchParams(location.search).get("lang") ??
      getLocalStorage("lang", navigator.language)) as Lang;

    if (lang in TOKENS === false) {
      lang = "en-US";
    }

    setLocalStorage("lang", lang);

    setContext({
      lang,
      tokens: TOKENS[lang],
    });
  }, []);

  if (context == null) {
    return null;
  }

  return (
    <TranslationContext.Provider value={context}>
      {children}
    </TranslationContext.Provider>
  );
}
