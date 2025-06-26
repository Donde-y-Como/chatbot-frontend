import React, { createContext, ReactNode, useContext, useState } from 'react'
import {
  Bundle,
  BundleContext,
  BundleDialogMode,
  BundleFilters,
} from '../types'

const BundleContextProvider = createContext<BundleContext | undefined>(
  undefined
)

export const useBundleContext = () => {
  const context = useContext(BundleContextProvider)
  if (!context) {
    throw new Error('useBundleContext must be used within a BundleProvider')
  }
  return context
}

interface BundleProviderProps {
  children: ReactNode
}

export const BundleProvider: React.FC<BundleProviderProps> = ({ children }) => {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<BundleFilters>({})
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null)
  const [dialogMode, setDialogMode] = useState<BundleDialogMode | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const addBundle = (bundle: Bundle) => {
    setBundles((prev) => [bundle, ...prev])
  }

  const updateBundle = (updatedBundle: Bundle) => {
    setBundles((prev) =>
      prev.map((bundle) =>
        bundle.id === updatedBundle.id ? updatedBundle : bundle
      )
    )
  }

  const removeBundle = (bundleId: string) => {
    setBundles((prev) => prev.filter((bundle) => bundle.id !== bundleId))
  }

  const contextValue: BundleContext = {
    // State
    bundles,
    isLoading,
    filters,
    selectedBundle,
    dialogMode,
    isDialogOpen,

    // Actions
    setBundles,
    setIsLoading,
    setFilters,
    setSelectedBundle,
    setDialogMode,
    setIsDialogOpen,
    addBundle,
    updateBundle,
    removeBundle,
  }

  return (
    <BundleContextProvider.Provider value={contextValue}>
      {children}
    </BundleContextProvider.Provider>
  )
}