import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGetQuickResponses } from '@/features/settings/quickResponse/hooks/useQuickResponses';
import { QuickResponse } from '@/features/settings/quickResponse/types';

/**
 * Custom hook to manage quick responses within the chat interface
 * Provides functionality for displaying, filtering, and selecting quick responses
 */
export const useQuickResponsesForChat = () => {
  const { data: quickResponses, isLoading, error } = useGetQuickResponses();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // Start with no selection

  // Memoize the filtered responses array to avoid unnecessary recalculations
  const filteredResponses = useMemo(() => {
    if (!quickResponses) {
      return [];
    }

    // Only perform filtering if we have a search term
    if (!searchTerm) {
      return quickResponses;
    }

    const searchTermLower = searchTerm.toLowerCase();
    return quickResponses.filter((response) => {
      const shortcutMatch = response.shortcut.toLowerCase().includes(searchTermLower);
      const messageMatch = response.message.toLowerCase().includes(searchTermLower);
      return shortcutMatch || messageMatch;
    });
  }, [searchTerm, quickResponses]);

  // Update selection when filtered results change
  useEffect(() => {
    // Only clear selection when search term changes
    if (searchTerm !== '') {
      setSelectedIndex(null);
    }
  }, [searchTerm, filteredResponses.length]);

  // Process input to detect and handle quick response commands
  const processInput = useCallback((inputValue: string) => {
    if (inputValue.startsWith('/')) {
      const newSearchTerm = inputValue.substring(1); // Remove the '/' prefix for searching
      setSearchTerm(newSearchTerm);
      
      // Only open dropdown if it's not already open
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
        // Don't select anything initially
        setSelectedIndex(null);
      }
      return true;
    } else {
      // Close the dropdown if it's open
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
        setSelectedIndex(null); // Clear selection when closing
      }
      return false;
    }
  }, [isDropdownOpen, setSearchTerm, setIsDropdownOpen, setSelectedIndex]);

  // Close the dropdown and reset selection state
  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
    setSelectedIndex(null); // Reset selection when dropdown closes
  }, [setIsDropdownOpen, setSelectedIndex]);

  // Navigate through responses with keyboard - disabled
  const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
    // Return false to disable keyboard navigation
    return false;
  }, []);

  
  // Helper function to ensure selected item is visible
  const ensureItemVisible = useCallback((index: number | null) => {
    // This is a stub function that would be implemented in the UI component
    // The actual scrolling will happen in the UI component when index changes
    return;
  }, []);

  // Get the currently selected response - memoize to avoid recalculating
  const getSelectedResponse = useCallback(() => {
    // If no item is explicitly selected
    if (selectedIndex === null) {
      return null;
    }
    
    // If there are no items or the index is out of bounds
    if (filteredResponses.length === 0 || selectedIndex >= filteredResponses.length) {
      return null;
    }
    
    // Return the selected item
    return filteredResponses[selectedIndex];
  }, [filteredResponses, selectedIndex]);

  // Add a method to safely set the selected index
  const setSelectedResponseIndex = useCallback((index: number | null) => {
    if (index === null) {
      setSelectedIndex(null);
    } else if (index >= 0 && index < filteredResponses.length) {
      setSelectedIndex(index);
    }
  }, [filteredResponses.length, setSelectedIndex]);

  // Memoize the returned object to ensure stable references
  return useMemo(() => ({
    isDropdownOpen,
    searchTerm,
    filteredResponses,
    selectedIndex,
    isLoading,
    error,
    processInput,
    closeDropdown,
    setIsDropdownOpen,
    handleKeyNavigation,
    getSelectedResponse,
    setSelectedResponseIndex,
    ensureItemVisible
  }), [
    isDropdownOpen,
    searchTerm,
    filteredResponses,
    selectedIndex,
    isLoading,
    error,
    processInput,
    closeDropdown,
    setIsDropdownOpen,
    handleKeyNavigation,
    getSelectedResponse,
    setSelectedResponseIndex,
    ensureItemVisible
  ]);
};
