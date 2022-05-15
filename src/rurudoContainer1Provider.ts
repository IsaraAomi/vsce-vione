import * as vscode from 'vscode';

export class RurudoContainer1Provider implements vscode.TreeDataProvider<RurudoContainer1TreeElement> {

    private rootElements: RurudoContainer1TreeElement[];
    constructor() {
        this.rootElements = this.createElements();
    }

    getTreeItem(element: RurudoContainer1TreeElement): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const collapsibleState = element.children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
        return new vscode.TreeItem(element.name, collapsibleState);
    }

    getChildren(element?: RurudoContainer1TreeElement): vscode.ProviderResult<RurudoContainer1TreeElement[]> {
        return element ? element.children : this.rootElements;
    }

    /**
     * @return rootElements
     */
    private createElements(): RurudoContainer1TreeElement[] {
        const parent1 = new RurudoContainer1TreeElement('Item1');
        ['Item1_1', 'Item1_2'].forEach(name => {
            parent1.addChild(new RurudoContainer1TreeElement(name));
        });

        const parent2 = new RurudoContainer1TreeElement('Item2');
        parent2.addChild(new RurudoContainer1TreeElement('Item2_1'));
        return [parent1, parent2];
    }
}

export class RurudoContainer1TreeElement {


    private _children: RurudoContainer1TreeElement[];
    private _parent: RurudoContainer1TreeElement | undefined | null;
    constructor(
        public name: string
    ) {
        this._children = [];
    }

    get parent(): RurudoContainer1TreeElement | undefined | null {
        return this._parent;
    }

    get children(): RurudoContainer1TreeElement[] {
        return this._children;
    }

    addChild(child: RurudoContainer1TreeElement) {
        child.parent?.removeChild(child);
        this._children.push(child);
        child._parent = this;
    }

    removeChild(child: RurudoContainer1TreeElement) {
        const childIndex = this._children.indexOf(child);
        if (childIndex >= 0) {
            this._children.splice(childIndex, 1);
            child._parent = null;
        }
    }
}
