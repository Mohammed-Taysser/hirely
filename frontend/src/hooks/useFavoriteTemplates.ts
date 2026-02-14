import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "favorite-templates";

export function useFavoriteTemplates() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (templateId: string) => favorites.includes(templateId),
    [favorites]
  );

  const toggleFavorite = useCallback((templateId: string) => {
    setFavorites((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId]
    );
  }, []);

  const addFavorite = useCallback((templateId: string) => {
    setFavorites((prev) =>
      prev.includes(templateId) ? prev : [...prev, templateId]
    );
  }, []);

  const removeFavorite = useCallback((templateId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== templateId));
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  };
}
