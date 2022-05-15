// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { RurudoContainer1Provider, RurudoContainer1TreeElement } from './rurudoContainer1Provider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const rurudoContainer1Provider = new RurudoContainer1Provider();
	vscode.window.registerTreeDataProvider('rurudoContainer1', rurudoContainer1Provider);
	const showDisposable = vscode.commands.registerCommand('rurudoContainer1.show', (element: RurudoContainer1TreeElement) => {
		if (element) {
			vscode.window.showInformationMessage(`This is ${element.name}`, { modal: true });
		}
	});

	context.subscriptions.push(
		showDisposable
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
