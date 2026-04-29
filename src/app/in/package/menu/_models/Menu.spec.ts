import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Menu, MenuContext, MenuElement, MenuItem, MenuLayout } from './Menu';
import { be } from 'date-fns/locale';

describe('MenuElement', () => {
    let element: MenuElement;

    beforeEach(() => {
        element = new MenuElement();
    });

    it('should be created', () => {
        expect(element).toBeTruthy();
    });

    it('should export empty object by default', () => {
        expect(element.export()).toEqual({});
    });

    it('should export leftover properties', () => {
        element.leftover = { customProp: 'value', anotherProp: 123 };
        const result = element.export();
        expect(result.customProp).toBe('value');
        expect(result.anotherProp).toBe(123);
    });

    it('should not export falsy leftover properties', () => {
        element.leftover = { trueProp: 'value', falseProp: false, nullProp: null, undefinedProp: undefined };
        const result = element.export();
        expect(result.trueProp).toBe('value');
        expect(result.falseProp).toBeUndefined();
        expect(result.nullProp).toBeUndefined();
        expect(result.undefinedProp).toBeUndefined();
    });

    it('should have default compliance', () => {
        const result = element.idCompliancy([]);
        expect(result.ok).toBeTrue();
        expect(result.idList).toEqual([]);
    });

    it('should pass idList through idCompliancy', () => {
        const idList = ['id1', 'id2', 'id3'];
        const result = element.idCompliancy(idList);
        expect(result.idList).toEqual(idList);
    });
});

describe('MenuLayout', () => {
    let layout: MenuLayout;

    beforeEach(() => {
        layout = new MenuLayout();
    });

    it('should be created with empty items', () => {
        expect(layout).toBeTruthy();
        expect(layout.items).toEqual([]);
    });

    it('should export empty layout', () => {
        const result = layout.export();
        expect(result.items).toBeUndefined();
    });

    it('should initialize items from schema', () => {
        layout = new MenuLayout({
            items: [
                { id: 'item1', label: 'Item 1' },
                { id: 'item2', label: 'Item 2' }
            ]
        });
        expect(layout.items.length).toBe(2);
        expect(layout.items[0].id).toBe('item1');
        expect(layout.items[1].id).toBe('item2');
    });

    it('should export items correctly', () => {
        layout = new MenuLayout({
            items: [
                { id: 'item1', label: 'Item 1', type: 'entry' }
            ]
        });
        const result = layout.export();
        expect(result.items).toBeDefined();
        expect(result.items.length).toBe(1);
        expect(result.items[0].id).toBe('item1');
    });

    it('should handle idCompliancy with duplicate ids', () => {
        layout = new MenuLayout({
            items: [
                { id: 'duplicate', label: 'Item 1' },
                { id: 'duplicate', label: 'Item 2' }
            ]
        });
        const result = layout.idCompliancy([]);
        expect(result.ok).toBeFalse();
    });

    it('should handle idCompliancy with unique ids', () => {
        layout = new MenuLayout({
            items: [
                { id: 'item1', label: 'Item 1' },
                { id: 'item2', label: 'Item 2' }
            ]
        });
        const result = layout.idCompliancy([]);
        expect(result.ok).toBeTrue();
        expect(result.idList).toContain('item1');
        expect(result.idList).toContain('item2');
    });

    it('should stop checking on first duplicate', () => {
        layout = new MenuLayout({
            items: [
                { id: 'item1', label: 'Item 1', children: [{ id: 'child1', label: 'Child 1' }] },
                { id: 'duplicate', label: 'Item 2' },
                { id: 'duplicate', label: 'Item 3' }
            ]
        });
        const result = layout.idCompliancy([]);
        expect(result.ok).toBeFalse();
    });
});

describe('MenuItem', () => {
    let item: MenuItem;

    beforeEach(() => {
        item = new MenuItem();
    });

    it('should be created with defaults', () => {
        expect(item).toBeTruthy();
        expect(item.id).toBe('');
        expect(item.label).toBe('');
        expect(item.icon).toBe('');
        expect(item.type).toBe('entry');
        expect(item.route).toBe('');
        expect(item.description).toBe('');
        expect(item.children).toEqual([]);
        expect(item.context).toBeTruthy();
    });

    it('should initialize from schema', () => {
        item = new MenuItem({
            id: 'menu1',
            label: 'Menu 1',
            icon: 'home',
            type: 'parent',
            route: '/home',
            description: 'Home menu'
        });
        expect(item.id).toBe('menu1');
        expect(item.label).toBe('Menu 1');
        expect(item.icon).toBe('home');
        expect(item.type).toBe('parent');
        expect(item.route).toBe('/home');
        expect(item.description).toBe('Home menu');
    });

    it('should initialize children from schema', () => {
        item = new MenuItem({
            id: 'parent',
            children: [
                { id: 'child1', label: 'Child 1' },
                { id: 'child2', label: 'Child 2' }
            ]
        });
        expect(item.children.length).toBe(2);
        expect(item.children[0].id).toBe('child1');
        expect(item.children[1].id).toBe('child2');
    });

    it('should initialize context from schema', () => {
        item = new MenuItem({
            id: 'menu1',
            context: {
                entity: 'User',
                view: 'list'
            }
        });
        expect(item.context.entity).toBe('User');
        expect(item.context.view).toBe('list');
    });

    it('should export all properties', () => {
        item = new MenuItem({
            id: 'menu1',
            label: 'Menu 1',
            icon: 'home',
            type: 'parent',
            route: '/home',
            description: 'Home menu'
        });
        const result = item.export();
        expect(result.id).toBe('menu1');
        expect(result.label).toBe('Menu 1');
        expect(result.icon).toBe('home');
        expect(result.type).toBe('parent');
        expect(result.route).toBe('/home');
        expect(result.description).toBe('Home menu');
    });

    it('should export children', () => {
        item = new MenuItem({
            id: 'parent',
            children: [
                { id: 'child1', label: 'Child 1' },
                { id: 'child2', label: 'Child 2' }
            ]
        });
        const result = item.export();
        expect(result.children).toBeDefined();
        expect(result.children.length).toBe(2);
    });

    it('should have available types', () => {
        const types = MenuItem.availableTypes;
        expect(types).toContain('parent');
        expect(types).toContain('entry');
        expect(types.length).toBe(2);
    });

    it('should detect duplicate id in hierarchy', () => {
        item = new MenuItem({
            id: 'parent',
            children: [
                { id: 'child1', label: 'Child 1' },
                { id: 'parent', label: 'Duplicate parent' }
            ]
        });
        const result = item.idCompliancy([]);
        expect(result.ok).toBeFalse();
    });

    it('should detect duplicate id in nested children', () => {
        item = new MenuItem({
            id: 'parent',
            children: [
                {
                    id: 'child1',
                    children: [
                        { id: 'parent', label: 'Duplicate nested' }
                    ]
                }
            ]
        });
        const result = item.idCompliancy([]);
        expect(result.ok).toBeFalse();
    });

    it('should pass compliance with unique ids', () => {
        item = new MenuItem({
            id: 'parent',
            children: [
                { id: 'child1', label: 'Child 1' },
                { id: 'child2', label: 'Child 2' }
            ]
        });
        const result = item.idCompliancy([]);
        expect(result.ok).toBeTrue();
    });

    it('should pass external id list to compliance check', () => {
        item = new MenuItem({
            id: 'item1',
            children: [
                { id: 'item2', label: 'Child' }
            ]
        });
        const result = item.idCompliancy(['external1', 'external2']);
        expect(result.ok).toBeTrue();
    });

    it('should reject if id conflicts with external list', () => {
        item = new MenuItem({
            id: 'external1'
        });
        const result = item.idCompliancy(['external1', 'external2']);
        expect(result.ok).toBeFalse();
    });
});

describe('MenuContext', () => {
    let context: MenuContext;

    beforeEach(() => {
        context = new MenuContext();
    });

    it('should be created with defaults', () => {
        expect(context).toBeTruthy();
        expect(context.entity).toBe('');
        expect(context.view).toBe('');
        expect(context.domain).toEqual([]);
        expect(context.sort).toBe('asc');
        expect(context.order).toBe('');
        expect(context.purpose).toBe('');
        expect(context.displayMode).toBe('');
    });

    it('should initialize from schema', () => {
        context = new MenuContext({
            entity: 'User',
            view: 'list',
            sort: 'desc',
            order: 'name',
            purpose: 'select',
            display_mode: 'popup'
        });
        expect(context.entity).toBe('User');
        expect(context.view).toBe('list');
        expect(context.sort).toBe('desc');
        expect(context.order).toBe('name');
        expect(context.purpose).toBe('select');
        expect(context.displayMode).toBe('popup');
    });

    it('should track domain with flag', () => {
        context = new MenuContext({
            domain: ['active', 'role=admin']
        });
        expect(context.domain).toEqual(['active', 'role=admin']);
        expect(context._hasDomain).toBeTrue();
    });

    it('should track sort with flag', () => {
        context = new MenuContext({
            sort: 'desc'
        });
        expect(context.sort).toBe('desc');
        expect(context._hasSort).toBeTrue();
    });

    it('should track order with flag', () => {
        context = new MenuContext({
            order: 'created_at'
        });
        expect(context.order).toBe('created_at');
        expect(context._hasOrder).toBeTrue();
    });

    it('should have valid purposes', () => {
        const purposes = MenuContext.PossiblePurpose;
        expect(purposes).toContain('');
        expect(purposes).toContain('view');
        expect(purposes).toContain('create');
        expect(purposes).toContain('update');
        expect(purposes).toContain('select');
        expect(purposes).toContain('add');
    });

    it('should have valid display modes', () => {
        const modes = MenuContext.PossibleDisplayMode;
        expect(modes).toContain('');
        expect(modes).toContain('stacked');
        expect(modes).toContain('popup');
    });

    it('should export only set properties', () => {
        context = new MenuContext({
            entity: 'User',
            view: 'list'
        });
        const result = context.export();
        expect(result.entity).toBe('User');
        expect(result.view).toBe('list');
        expect(result.domain).toBeUndefined();
        expect(result.sort).toBeUndefined();
    });

    it('should export domain when set', () => {
        context = new MenuContext({
            domain: ['active']
        });
        const result = context.export();
        expect(result.domain).toEqual(['active']);
    });

    it('should export sort when set', () => {
        context = new MenuContext({
            sort: 'desc'
        });
        const result = context.export();
        expect(result.sort).toBe('desc');
    });

    it('should export order when set', () => {
        context = new MenuContext({
            order: 'name'
        });
        const result = context.export();
        expect(result.order).toBe('name');
    });

    it('should export purpose when set', () => {
        context = new MenuContext({
            purpose: 'select'
        });
        const result = context.export();
        expect(result.purpose).toBe('select');
    });


    it('should use display_mode key in schema but displayMode in export', () => {
        context = new MenuContext({
            display_mode: 'popup'
        });
        const result = context.export();
        expect(result.display_mode).toBe('popup');
    });
});

describe('Menu', () => {
    let item: Menu;
    let empty = { 'name': '', 'access': { 'groups': ['users'] }, 'layout': {} };

    beforeEach(() => {
        item = new Menu();
    });

    it('should export empty', () => {
        expect(compareDictRecurs(item.export(), empty)).toBe(0);
    });

    it('should export a copy of import', () => {
        item = new Menu({
            'name': 'a',
            'access': {
                'groups': ['users']
            },
            'layout': {}
        });
        expect(compareDictRecurs(item.export(), {
            'name': 'a',
            'access': {
                'groups': ['users']
            },
            'layout': {}
        })).toBe(0);
    });

    it('should be id compliant', () => {
        item = new Menu({
            'name': 'a',
            'access': {
                'groups': ['users']
            },
            'layout': {}
        });
        expect(item.idCompliancy([]).ok).toBeTrue();
    });

    it('should be id compliant with id list', () => {
        item = new Menu({
            'name': 'a',
            'access': {
                'groups': ['users']
            },
            'layout': {}
        });
        expect(item.idCompliancy(['id1', 'id2']).ok).toBeTrue();
    });

    it('should initialize name from schema', () => {
        item = new Menu({ name: 'Main Menu' });
        expect(item.name).toBe('Main Menu');
    });

    it('should initialize access from schema', () => {
        const access = { groups: ['admin', 'users'] };
        item = new Menu({ access });
        expect(item.access).toEqual(access);
    });

    it('should initialize layout from schema', () => {
        item = new Menu({
            layout: {
                items: [{ id: 'item1', label: 'Item 1' }]
            }
        });
        expect(item.layout.items.length).toBe(1);
        expect(item.layout.items[0].id).toBe('item1');
    });

    it('should detect duplicate ids in layout', () => {
        item = new Menu({
            layout: {
                items: [
                    { id: 'duplicate', label: 'Item 1' },
                    { id: 'duplicate', label: 'Item 2' }
                ]
            }
        });
        const result = item.idCompliancy([]);
        expect(result.ok).toBeFalse();
    });

    it('should handle leftover properties', () => {
        item = new Menu({
            name: 'Test',
            customProp: 'custom value'
        });
        const result = item.export();
        expect(result.customProp).toBe('custom value');
    });
})

function compareDictRecurs(dict1:any, dict2:any):number {
    try {
        if (dict1 === undefined) return -1
        if (dict2 === undefined) return 1
        if (typeof(dict1) !== typeof({}) && typeof(dict1) !== typeof({}) && dict1 === dict2) {
            return 0
        }
        let res = 0;
        for (var item in dict1) {
            if(dict2[item] === undefined) return 1
            res = compareDictRecurs(dict1[item],dict2[item])
            if(res !== 0) return 1
        }
        return 0
    } catch (e) {
        return 1
    }
}