import { WorkflowLink, Anchor } from "./WorkflowLink";
import { WorkflowNode } from "./WorkflowNode";


describe('WorkflowLink', () => {
    let item: WorkflowLink;
    let nodeFrom: WorkflowNode;
    let nodeTo: WorkflowNode;
    let anchorFrom: Anchor;
    let anchorTo: Anchor;

    beforeEach(() => {
        // Reset any necessary state before each test
        nodeFrom = new WorkflowNode('NodeFrom');
        nodeTo = new WorkflowNode('NodeTo');
        anchorFrom = Anchor.Top;
        anchorTo = Anchor.Bottom;
        item = new WorkflowLink(nodeFrom, nodeTo, anchorFrom, anchorTo);
    });

    it('should export empty', () => {
        expect(item.export()).toEqual({ status: 'NodeTo', name: 'transition' });
    });

    it('should fill id', () => {
        item = new WorkflowLink(nodeFrom, nodeTo, Anchor.Top, Anchor.Bottom, {
            name: 'Transition1',
            watch: ['watch1', 'watch2'],
            description: 'A transition from NodeFrom to NodeTo',
            help: 'This is a help text for the transition',
            onafter: 'onAfterAction',
            policies: ['policy1', 'policy2'],
            domain: ['domain1', 'domain2']
        });
        expect(item.name).toBe('Transition1');
        expect(item.watch).toEqual(['watch1', 'watch2']);
        expect(item.description).toBe('A transition from NodeFrom to NodeTo');
        expect(item.help).toBe('This is a help text for the transition');
        expect(item.onAfter).toBe('onAfterAction');
        expect(item.policies).toEqual(['policy1', 'policy2']);
        expect(item.domain).toEqual(['domain1', 'domain2']);
    });

    it('should export a copy of import', () => {
        const scheme = {
            name: 'Transition1',
            watch: ['watch1', 'watch2'],
            description: 'A transition from NodeFrom to NodeTo',
            help: 'This is a help text for the transition',
            onafter: 'onAfterAction',
            policies: ['policy1', 'policy2'],
            domain: ['domain1', 'domain2']
        };
        item = new WorkflowLink(nodeFrom, nodeTo, Anchor.Top, Anchor.Bottom, scheme);
        const ret = item.export();
        expect(ret).toEqual({
            name: 'Transition1',
            watch: ['watch1', 'watch2'],
            description: 'A transition from NodeFrom to NodeTo',
            help: 'This is a help text for the transition',
            onafter: 'onAfterAction',
            policies: ['policy1', 'policy2'],
            domain: ['domain1', 'domain2'],
            status: 'NodeTo'
        });
    });
});
