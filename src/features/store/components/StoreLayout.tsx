import React from 'react'

interface StoreLayoutProps {
  children: React.ReactNode
  isMobileMenuOpen: boolean
  onCloseMobileMenu: () => void
}

export function StoreLayout({
  children,
  isMobileMenuOpen,
  onCloseMobileMenu
}: StoreLayoutProps) {
  return (
    <div
      className='min-h-screen bg-background flex flex-col lg:flex-row'
      style={{ touchAction: 'pan-y' }}
    >
      {children}

      {/* Overlay para cerrar menú móvil */}
      {isMobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/20 z-15 lg:hidden'
          onClick={onCloseMobileMenu}
        />
      )}
    </div>
  )
}