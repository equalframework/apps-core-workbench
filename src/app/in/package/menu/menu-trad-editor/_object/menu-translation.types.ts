// ─── Valeur traductible ───────────────────────────────────────────────────────

export interface MenuTranslationValue {
  value: string;
}

// ─── Champ d'un élément de menu (label seulement) ────────────────────────────

export interface MenuTranslationField {
  is_active: boolean;
  label: MenuTranslationValue;
}

// ─── Config d'une colonne d'input dans le composant générique ─────────────────

export interface MenuFieldColumnConfig {
  /** Clé de l'objet item à binder (ex: 'label') */
  key: string;
  /** Placeholder affiché dans l'input */
  placeholder: string;
  /** Largeur en colonnes dans le mat-grid-list (total 16, fixe = 3) */
  colspan: number;
}

// ─── Configs prédéfinies réutilisables ────────────────────────────────────────

export const MENU_FIELD_CONFIGS: {
  menuItem: MenuFieldColumnConfig[];
} = {
  menuItem: [
    { key: 'label', placeholder: 'Translation', colspan: 13 }
  ]
};
