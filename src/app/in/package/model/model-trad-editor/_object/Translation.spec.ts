import { Translation, Translator, ErrorTranslator, ModelTranslator, ViewTranslator, ViewRouteTranslator, ViewActionTranslator, ViewLayoutItemTranslator, ErrorItemTranslator } from './Translation';
import { View } from '../../_object/View';

describe('Translation', () => {
    it('should create an instance', () => {
        expect(new Translation()).toBeTruthy();
    });
});

describe('Translator', () => {
    it('should create an instance', () => {
        expect(new Translator(['test'], [{ name: 'view', view: new View({}, 'list') }])).toBeTruthy();
    });

    it('should fill and export values correctly', () => {
        const translator = new Translator(['test'], [{ name: 'test_list', view: new View({}, 'list') }]);
        const values = {
            name: 'Test Name',
            description: 'Test Description',
            plural: 'Test Plural',
            model: {
                test: {
                    is_active: true,
                    label: 'Test Label',
                    description: 'Test Model Description',
                    help: 'Test Help'
                }
            },
            view: {
                test_list: {
                    name: 'Test View Name',
                    description: 'Test View Description',
                    layout: {
                        
                    },
                }
                },
            error: {
                test: {
                    error1: {
                        is_active: true,
                        _val: 'Test Error Value'
                    }
                }
            }
        }
        translator.fill(values);
        const exported = translator.export();
        expect(exported.name).toBe('Test Name');
        expect(exported.description).toBe('Test Description');
        expect(exported.plural).toBe('Test Plural');
        expect(exported.model.test.label).toBe('Test Label');
        expect(exported.model.test.description).toBe('Test Model Description');
        expect(exported.model.test.help).toBe('Test Help');
        expect(exported.view.test_list.name).toBe('Test View Name');
        expect(exported.view.test_list.description).toBe('Test View Description');
        expect(exported.view.test_list.layout).toBeUndefined();
        expect(exported.error.test.error1._val).toBe('Test Error Value');
    });

    it('should export only active errors', () => {
        const translator = new Translator(['test'], [{ name: 'test_list', view: new View({}, 'list') }]);
        const values = {
            name: 'Test Name',
            description: 'Test Description',
            plural: 'Test Plural',
            error: {
                test: {
                    error1: {
                        is_active: true,
                        _val: 'Active Error Value'
                    },
                    error2: {
                        is_active: false,
                        _val: 'Inactive Error Value'
                    }
                }
            }
        }
        translator.fill(values);
        const exported = translator.export();
        expect(exported.error.test.error1._val).toBe('Active Error Value');
        expect(exported.error.test.error2).toBeUndefined();
    });

    it('should export empty error object if no active errors', () => {
        const translator = new Translator(['test'], [{ name: 'test_list', view: new View({}, 'list') }]);
        const values = {
            name: 'Test Name',
            description: 'Test Description',
            plural: 'Test Plural',
            error: {
                test: {
                    error1: {
                        is_active: false,
                        _val: 'Inactive Error Value'
                    }
                }
            }
        }
        translator.fill(values);
        const exported = translator.export();
        expect(exported.error).toBeUndefined();
    });

    it('should export empty view object if no active layout, action or route translations', () => {
        const translator = new Translator(['test'], [{ name: 'test_list', view: new View({}, 'list') }]);
        const values = {
            name: 'Test Name',
            description: 'Test Description',
            plural: 'Test Plural',
            view: {
                test_list: {
                    name: 'Test View Name',
                    description: 'Test View Description',
                    layout: {
                    },
    
                    actions: {
                    },
                    routes: {
                    }
                }
            }
        }
        translator.fill(values);
        const exported = translator.export();
        expect(exported.view.test_list.layout).toBeUndefined();
        expect(exported.view.test_list.actions).toBeUndefined();
        expect(exported.view.test_list.routes).toBeUndefined();
    });

    it('should ignore values for non-existing layout items, actions and routes', () => {
        const translator = new Translator(['test'], [{ name: 'test_list', view: new View({}, 'list') }]);
        const values = {
            name: 'Test Name',
            description: 'Test Description',
            plural: 'Test Plural',
            view: {
                test_list: {
                    name: 'Test View Name',
                    description: 'Test View Description',
                    layout: {
                        'non_existing_item': {
                            is_active: true,
                            label: 'Non-existing Item Label'
                        }
                    },
                    actions: {
                        'NON_EXISTING_ACTION': {
                            is_active: true,
                            label: 'Non-existing Action Label',
                            description: 'Non-existing Action Description'
                        }
                    },
                    routes: {
                        'NON_EXISTING_ROUTE': {
                            is_active: true,
                            label: 'Non-existing Route Label',
                            description: 'Non-existing Route Description'
                        }
                    }
                }
            }
        }
        translator.fill(values);
        const exported = translator.export();
        expect(exported.view.test_list.layout).toBeUndefined();
        expect(exported.view.test_list.actions).toBeUndefined();
        expect(exported.view.test_list.routes).toBeUndefined();
    });

    
});

describe('ErrorTranslator', () => {
    it('should create an instance', () => {
        expect(new ErrorTranslator()).toBeTruthy();
    });
});

describe('ModelTranslator', () => {
    it('should create an instance', () => {
        expect(new ModelTranslator()).toBeTruthy();
    });
});

describe('ViewTranslator', () => {
    it('should create an instance', () => {
        expect(new ViewTranslator(new View({}, 'list'))).toBeTruthy();
    });

    it('should include nested layout item keys for translatable field items', () => {
        const view = new View({
            layout: {
                groups: [{
                    id: 'group.main',
                    sections: [{
                        id: 'section.main',
                        rows: [{
                            id: 'row.main',
                            columns: [{
                                id: 'column.main',
                                items: [
                                    { type: 'field', value: 'code' },
                                    { type: 'field', value: 'title' }
                                ]
                            }]
                        }]
                    }]
                }]
            }
        }, 'form');

        const translator = new ViewTranslator(view);
        expect(translator.layout['group.main']).toBeTruthy();
        expect(translator.layout['section.main']).toBeTruthy();
        expect(translator.layout['row.main']).toBeTruthy();
        expect(translator.layout['column.main']).toBeTruthy();
        expect(translator.layout['code']).toBeTruthy();
        expect(translator.layout['title']).toBeTruthy();
    });

    it('should keep view actions and routes registration intact', () => {
        const view = new View({
            actions: [{
                id: 'ACTION.CUSTOM',
                label: 'Custom',
                description: 'Custom action',
                controller: 'core_model_collect'
            }],
            routes: [{
                id: 'ROUTE.CUSTOM',
                label: 'Route label',
                description: 'Route description',
                route: '/custom'
            }]
        }, 'list');

        const translator = new ViewTranslator(view);
        expect(translator.actions['ACTION.CUSTOM']).toBeTruthy();
        expect(translator.routes['ROUTE.CUSTOM']).toBeTruthy();
    });
});

describe('ViewRouteTranslator', () => {
    it('should create an instance', () => {
        expect(new ViewRouteTranslator()).toBeTruthy();
    });

    it('should fill values correctly', () => {
        const routeTranslator = new ViewRouteTranslator();
        const values = {
            is_active: true,
            label: 'Test Route Label',
            description: 'Test Route Description'
        }
        routeTranslator.fill(values);
        expect(routeTranslator.isActive).toBe(true);
        expect(routeTranslator.label.value).toBe('Test Route Label');
        expect(routeTranslator.description.value).toBe('Test Route Description');
    });
});

describe('ViewActionTranslator', () => {
    it('should create an instance', () => {
        expect(new ViewActionTranslator()).toBeTruthy();
    });

    it('should fill values correctly', () => {
        const actionTranslator = new ViewActionTranslator();
        const values = {
            is_active: true,
            label: 'Test Action Label',
            description: 'Test Action Description'
        }
        actionTranslator.fill(values);
        expect(actionTranslator.isActive).toBe(true);
        expect(actionTranslator.label.value).toBe('Test Action Label');
        expect(actionTranslator.description.value).toBe('Test Action Description');
    });
});

describe('ViewLayoutItemTranslator', () => {
    it('should create an instance', () => {
        expect(new ViewLayoutItemTranslator()).toBeTruthy();
    });

    it('should fill values correctly', () => {
        const layoutItemTranslator = new ViewLayoutItemTranslator();
        const values = {
            is_active: true,
            label: 'Test Layout Item Label'
        }
        layoutItemTranslator.fill(values);
        expect(layoutItemTranslator.isActive).toBe(true);
        expect(layoutItemTranslator.label.value).toBe('Test Layout Item Label');
    });
});

describe('ErrorItemTranslator', () => {
    it('should create an instance', () => {
        expect(new ErrorItemTranslator()).toBeTruthy();
    });

    it('should fill values correctly', () => {
        const errorItemTranslator = new ErrorItemTranslator();
        const values = {
            is_active: true,
            _val: 'Test Error Value'
        }
        errorItemTranslator.fill(values);
        expect(errorItemTranslator.isActive).toBe(true);
        expect(errorItemTranslator._val.value).toBe('Test Error Value');
    });
});