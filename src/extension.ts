// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Explorer
	const provider = new ImagesViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ImagesViewProvider.viewType, provider));
	context.subscriptions.push(
		vscode.commands.registerCommand('updateImage', () => {
			provider.updateImage();
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
	}

	public updateImage() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'updateImage' });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		return `<!DOCTYPE html>
			<html lang="en">
			<body>
				<img id="image_0"/>
				<script src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}


