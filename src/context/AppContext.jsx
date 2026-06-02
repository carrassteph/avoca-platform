import { createContext, useContext, useReducer } from 'react'
import { initialTemplates, initialAgents, initialBrands, defaultTemplateFields } from '../data/mockData'

const AppContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'CREATE_TEMPLATE': {
      const newTemplate = {
        id: `tmpl-${Date.now()}`,
        name: action.payload.name || 'Untitled template',
        type: 'custom',
        status: 'draft',
        lastEdited: new Date().toISOString().slice(0, 10),
        fields: { ...defaultTemplateFields, ...action.payload.fields },
      }
      return { ...state, templates: [...state.templates, newTemplate] }
    }
    case 'UPDATE_TEMPLATE': {
      return {
        ...state,
        templates: state.templates.map(t =>
          t.id === action.payload.id
            ? { ...t, ...action.payload, lastEdited: new Date().toISOString().slice(0, 10) }
            : t
        ),
      }
    }
    case 'PUBLISH_TEMPLATE': {
      return {
        ...state,
        templates: state.templates.map(t =>
          t.id === action.payload.id
            ? { ...t, ...action.payload, status: 'published', lastEdited: new Date().toISOString().slice(0, 10) }
            : t
        ),
      }
    }
    case 'ARCHIVE_TEMPLATE': {
      const activeAgents = state.agents.filter(
        a => a.templateId === action.payload.id && (a.status === 'live' || a.status === 'draft')
      )
      if (activeAgents.length > 0) {
        return { ...state, _archiveError: action.payload.id }
      }
      return {
        ...state,
        _archiveError: null,
        templates: state.templates.filter(t => t.id !== action.payload.id),
      }
    }
    case 'DUPLICATE_TEMPLATE': {
      const source = state.templates.find(t => t.id === action.payload.id)
      if (!source) return state
      const copy = {
        ...source,
        id: `tmpl-${Date.now()}`,
        name: `${source.name} (copy)`,
        type: 'custom',
        status: 'draft',
        lastEdited: new Date().toISOString().slice(0, 10),
      }
      return { ...state, templates: [...state.templates, copy] }
    }
    case 'CLEAR_ARCHIVE_ERROR':
      return { ...state, _archiveError: null }

    case 'CREATE_AGENT': {
      const newAgent = {
        id: `agt-${Date.now()}`,
        ...action.payload,
        createdAt: new Date().toISOString().slice(0, 10),
      }
      return { ...state, agents: [...state.agents, newAgent] }
    }
    case 'UPDATE_AGENT': {
      return {
        ...state,
        agents: state.agents.map(a =>
          a.id === action.payload.id ? { ...a, ...action.payload } : a
        ),
      }
    }
    case 'ARCHIVE_AGENT': {
      return {
        ...state,
        agents: state.agents.filter(a => a.id !== action.payload.id),
      }
    }
    case 'DUPLICATE_AGENT': {
      const source = state.agents.find(a => a.id === action.payload.id)
      if (!source) return state
      const copy = {
        ...source,
        id: `agt-${Date.now()}`,
        brandName: `${source.brandName} (copy)`,
        status: 'draft',
        createdAt: new Date().toISOString().slice(0, 10),
      }
      return { ...state, agents: [...state.agents, copy] }
    }

    case 'CREATE_BRAND': {
      const newBrand = {
        id: `brand-${Date.now()}`,
        ...action.payload,
        addedAt: new Date().toISOString().slice(0, 10),
      }
      return { ...state, brands: [...state.brands, newBrand] }
    }
    case 'UPDATE_BRAND': {
      return {
        ...state,
        brands: state.brands.map(b =>
          b.id === action.payload.id ? { ...b, ...action.payload } : b
        ),
      }
    }
    case 'DELETE_BRAND': {
      return {
        ...state,
        brands: state.brands.filter(b => b.id !== action.payload.id),
      }
    }

    case 'SHOW_TOAST':
      return { ...state, toast: action.payload }
    case 'HIDE_TOAST':
      return { ...state, toast: null }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    templates: initialTemplates,
    agents: initialAgents,
    brands: initialBrands,
    toast: null,
    _archiveError: null,
  })

  const showToast = (message, variant = 'success') => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, variant } })
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000)
  }

  return (
    <AppContext.Provider value={{ state, dispatch, showToast }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
