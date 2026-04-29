export interface TranslationValue {
  value: string;
}

export interface TranslationModelField {
  is_active: boolean;
  label: TranslationValue;
  description: TranslationValue;
  help: TranslationValue;
}

export interface TranslationLayoutField {
  is_active: boolean;
  label: TranslationValue;
}

export interface TranslationActionField {
  is_active: boolean;
  label: TranslationValue;
  description: TranslationValue;
}

export interface TranslationErrorField {
  is_active: boolean;
  _val: TranslationValue;
}

export interface FieldColumnConfig {
  key: string;
  placeholder: string;
  colspan: number;
}

export const FIELD_CONFIGS = {
  model: [
    { key: 'label',       placeholder: 'Label',       colspan: 3 },
    { key: 'description', placeholder: 'Description', colspan: 5 },
    { key: 'help',        placeholder: 'Help',        colspan: 5 },
  ] as FieldColumnConfig[],

  layout: [
    { key: 'label', placeholder: 'Label', colspan: 13 },
  ] as FieldColumnConfig[],

  actions: [
    { key: 'label',       placeholder: 'Label',       colspan: 5 },
    { key: 'description', placeholder: 'Description', colspan: 8 },
  ] as FieldColumnConfig[],

  error: [
    { key: '_val', placeholder: 'Label', colspan: 13 },
  ] as FieldColumnConfig[],
} as const;
