// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const images = {
	'small': 'https://downloads.fanbox.cc/images/post/3802639/irk3hJmEJNmiT5AUU8pebQ4m.png',
	'big': 'https://downloads.fanbox.cc/images/post/3802639/xNc5Ai83w5ZwALhSIjh8E8y3.png'
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Explorer
	const provider = new ColorsViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider));
	context.subscriptions.push(
		vscode.commands.registerCommand('updateImage', () => {
			provider.updateImage();
		}));
}

// this method is called when your extension is deactivated
export function deactivate() {}

class ColorsViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'imageView';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, images['small']);
	}

	public updateImage() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'updateImage' });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview, imagePath: string) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleUpdateUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'update.css'));
		
		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();
		
		return `<!DOCTYPE html>
			<html lang="en">
			<head>
			
				<img src="${imagePath}"/>
	
				<meta charset="UTF-8">
				
				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			
				<link href="${styleUpdateUri}" rel="stylesheet">

			</head>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
