export interface MenuTranslationValue {
  value: string;
}

export interface MenuTranslationField {
  is_active: boolean;
  label: MenuTranslationValue;
}

export interface MenuFieldColumnConfig {
  key: string;
  placeholder: string;
  colspan: number;
}

export const MENU_FIELD_CONFIGS: {
  menuItem: MenuFieldColumnConfig[];
} = {
  menuItem: [
    { key: 'label', placeholder: 'Label', colspan: 13 }
  ]
};
