import { Field } from './Field';
describe('Field', () => {

    beforeEach(() => {
        Field.type_directives = {
            string: {type: true, readonly: true, description: true, usage: true, default: true, selection: true, dependencies: true, visible: true, domain: true},
            number: {type: true, readonly: true, description: true, usage: true, default: true, selection: true, dependencies: true, visible: true, domain: true},
            computed: {type: true, readonly: true, description: true, usage: true, default: false, selection: false, dependencies: false, visible: false, domain: false},
        };
        Field.uneditable_name = ['id', 'created_at', 'updated_at'];
    });

    it('should create an instance', () => {
        expect(new Field()).toBeTruthy();
    });

    it('should fill the field with the provided schema', () => {
        const schema = {
            type: 'string',
            description: 'A test field',
            readonly: true,
            default: 'default value',
            selection: ['option1', 'option2'],
            dependencies: ['other_field'],
            domain: 'test_domain',
            extra_key: 'extra_value'
        };
        const field = new Field(schema, 'test_usage');
        expect(field.type).toBe('string');
        expect(field.name).toBe('test_usage');
        expect(field.description).toBe('A test field');
        expect(field.readonly).toBe(true);
        expect(field.default).toBe('default value');
        expect(field.selection).toEqual(['option1', 'option2']);
        expect(field.dependencies).toEqual(['other_field']);
        expect(field.visible).toEqual([]);
        expect(field.domain).toBe('test_domain');
        expect(field._leftover).toEqual({extra_key: 'extra_value'});
    });

    it('should determine if the field is uneditable based on its name', () => {
        const uneditableField = new Field({}, 'id');
        const editableField = new Field({}, 'name');
        expect(uneditableField.isUneditable).toBe(true);
        expect(editableField.isUneditable).toBe(false);
    });

    it('should return correct comparison result from areSimilar method', () => {
        const field1 = new Field({type: 'string', description: 'A test field'}, 'field1');
        const field2 = new Field({type: 'string', description: 'A test field'}, 'field2');
        const field3 = new Field({type: 'number', description: 'A different field'}, 'field3');
        expect(field1.areSimilar(field2)).toBe(true);
        expect(field1.areSimilar(field3)).toBe(false);
    });
});