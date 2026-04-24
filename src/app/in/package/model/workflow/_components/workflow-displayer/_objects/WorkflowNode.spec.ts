import { WorkflowNode } from './WorkflowNode';

describe('WorkflowNode', () => {
    let item: WorkflowNode;

    beforeEach(() => {
        // Reset any necessary state before each test
        item = new WorkflowNode('Node1');
    });

    it('should export empty', () => {
        expect(item.export()).toEqual({ icon: 'hub' });
    });

    it('should fill id', () => {
        item = new WorkflowNode('Node1', {
            description: 'This is a node',
            help: 'This is a help text for the node',
            icon: 'custom-icon',
            position: { x: 100, y: 200 }
        });
        expect(item.name).toBe('Node1');
        expect(item.description).toBe('This is a node');
        expect(item.help).toBe('This is a help text for the node');
        expect(item.icon).toBe('custom-icon');
        expect(item.position).toEqual({ x: 100, y: 200 });
        expect(item.initialPos).toEqual({ x: 100, y: 200 });
    });

    it('should export a copy of import', () => {
        item = new WorkflowNode('Node1', {
            description: 'This is a node',
            help: 'This is a help text for the node',
            icon: 'custom-icon',
            position: { x: 100, y: 200 }
        });
        expect(item.export()).toEqual({
            description: 'This is a node',
            help: 'This is a help text for the node',
            icon: 'custom-icon'
        });
    });
});