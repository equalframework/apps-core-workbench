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
  /** Clé de l'objet item à binder (ex: 'label', 'description', '_val') */
  key: string;
  /** Placeholder affiché dans l'input */
  placeholder: string;
  /** Largeur en colonnes dans le mat-grid-list (total 16, fixe = 3) */
  colspan: number;
}

export const FIELD_CONFIGS = {
  /** Model : label (3) + description (5) + help (5) = 13 */
  model: [
    { key: 'label',       placeholder: 'Label',       colspan: 3 },
    { key: 'description', placeholder: 'Description', colspan: 5 },
    { key: 'help',        placeholder: 'Help',        colspan: 5 },
  ] as FieldColumnConfig[],

  /** Layout : label (13) = 13 */
  layout: [
    { key: 'label', placeholder: 'Label', colspan: 13 },
  ] as FieldColumnConfig[],

  /** Actions / Routes : label (5) + description (8) = 13 */
  actions: [
    { key: 'label',       placeholder: 'Label',       colspan: 5 },
    { key: 'description', placeholder: 'Description', colspan: 8 },
  ] as FieldColumnConfig[],

  /** Errors : _val (13) = 13 */
  error: [
    { key: '_val', placeholder: 'Label', colspan: 13 },
  ] as FieldColumnConfig[],
} as const;
