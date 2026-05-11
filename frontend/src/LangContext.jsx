import { createContext, useContext, useState } from 'react'
import translations from './i18n'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('gr')
  const t = (key) => translations[lang][key] ?? translations['gr'][key] ?? key
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
