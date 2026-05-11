import { createContext, useContext, useState } from 'react'
import translations from './i18n'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')

  function changeLang(l) {
    localStorage.setItem('lang', l)
    setLang(l)
  }

  const t = (key) => translations[lang]?.[key] ?? translations['en'][key] ?? key
  return (
    <LangContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
