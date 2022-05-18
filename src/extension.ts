// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const provider = new ImagesViewProvider(context.extensionUri);

	// WebviewView
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ImagesViewProvider.viewType, provider));

	// Push Next Image Button
	context.subscriptions.push(vscode.commands.registerCommand('nextImage', () => {
		provider.nextImage();
	}));
		
	// Listen to configuration when they are changed
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
		// When change image list
		if (e.affectsConfiguration('vione.view.uniqueImageArray')) {
			provider.updateImagesList();
		}
		// When change transition time
		if (e.affectsConfiguration('vione.view.transitionTime')) {
			provider.setTransitionTime();
		}
	}));
}

// This method is called when the extension is deactivated
export const deactivate = () => {};

class ImagesViewProvider implements vscode.WebviewViewProvider {

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
		
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		
		// Load configuration at start WebviewView
		const images_list: string[] = vscode.workspace.getConfiguration().get('vione.view.uniqueImageArray') || [""];
		const transition_time: number = vscode.workspace.getConfiguration().get('vione.view.transitionTime') || 0;
		if (this._view) {
			this._view.webview.postMessage({ type: 'initilize', images: images_list, time: transition_time });
		}
		// console.log("start_WebviewView");

		// Load configuration at change WebviewView
		if (this._view) {
			this._view?.onDidChangeVisibility(e => {
				const images_list: string[] = vscode.workspace.getConfiguration().get('vione.view.uniqueImageArray') || [""];
				const transition_time: number = vscode.workspace.getConfiguration().get('vione.view.transitionTime') || 0;
				if (this._view) {
					this._view.webview.postMessage({ type: 'initilize', images: images_list, time: transition_time });
				}
				// console.log("change_WebviewView");
			});
		}
	}

	public nextImage() {
		const images_list: string[] = vscode.workspace.getConfiguration().get('vione.view.uniqueImageArray') || [""];
		if (this._view) {
			this._view.webview.postMessage({ type: 'nextImage', images: images_list });
		}
	}

	public updateImagesList() {
		const images_list: string[] = vscode.workspace.getConfiguration().get('vione.view.uniqueImageArray') || [""];
		if (this._view) {
			this._view.webview.postMessage({ type: 'updateImagesList', images: images_list });
		}
	}

	public setTransitionTime() {
		const transition_time: number = vscode.workspace.getConfiguration().get('vione.view.transitionTime') || 0;
		if (this._view) {
			this._view.webview.postMessage({ type: 'setTransitionTime', time: transition_time });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta 
					http-equiv="Content-Security-Policy"
					content="default-src 'none'; img-src ${webview.cspSource} https:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			</head>
			<body>
				<!--
					<p id=sample>sample test</p>
				-->
				<img id="image_0"/>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
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
