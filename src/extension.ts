// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

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
		if (e.affectsConfiguration('vione.view.imageWebUrlArray') ||
			e.affectsConfiguration('vione.view.imageLocalFullPathArray') || 
			e.affectsConfiguration('vione.view.imageRemoteFullPathArray')) {
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

	// ----- public member ----- //

	public static readonly viewType = 'imageView';
	
	// ----- private member ----- //

	private _view?: vscode.WebviewView;
	private _transition_time?: number;
	private _start_image?: string; 
	private _imageWebUrlArray?: string[];
	private _imageFsFullPathArray?: string[];
	private _imageFsUrlArray?: string[];
	private _imageUrlArray?: string[];
	private _env?: string;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	// ----- public function ----- //

	// `resolveWebviewView` is called when a view first becomes visible.
	// This may happen when the view is first loaded or when the user hides and then shows a view again.
	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		if (vscode.env.remoteName == "wsl" || vscode.env.remoteName == "ssh-remote") {
			this._env = "remote";
		} else {
			this._env = "local";
		}
		
		this._loadConfiguration();
		
		// Show HTML
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		// Initialize at start WebviewView
		if (this._view) {
			this._view.webview.postMessage({
				type: 'initilize',
				imageUrlArray: this._imageUrlArray,
				transition_time: this._transition_time,
				start_image: this._start_image
			});
			// console.log("start_WebviewView");
		}

		// Reload at change WebviewView
		if (this._view) {
			this._view.onDidChangeVisibility(e => {
				this._loadConfiguration();
				if (this._view) {
					this._view.webview.postMessage({
						type: 'initilize',
						imageUrlArray: this._imageUrlArray,
						transition_time: this._transition_time,
						start_image: this._start_image
					});
				}
				// console.log("change_WebviewView");
			});
		}
	}

	public nextImage() {
		this._loadConfiguration();
		if (this._view) {
			this._view.webview.postMessage({
				type: 'nextImage',
				imageUrlArray: this._imageUrlArray,
				transition_time: this._transition_time,
				start_image: this._start_image
			});
		}
	}

	public updateImagesList() {
		this._loadConfiguration();
		if (this._view) {
			this._view.webview.postMessage({
				type: 'updateImagesList',
				imageUrlArray: this._imageUrlArray,
				transition_time: this._transition_time,
				start_image: this._start_image
			});
		}
	}

	public setTransitionTime() {
		this._loadConfiguration();
		if (this._view) {
			this._view.webview.postMessage({
				type: 'setTransitionTime',
				imageUrlArray: this._imageUrlArray,
				transition_time: this._transition_time,
				start_image: this._start_image
			});
		}
	}

	// ----- private function ----- //

	private _getFsUrlArray(fsFullPathArray: string[]) {
		let fsUrlArray = [];
		if (this._view) {
			for (let i = 0; i < fsFullPathArray.length; i++) {
				fsUrlArray.push(this._view.webview.asWebviewUri(vscode.Uri.file(fsFullPathArray[i])).toString());
			}
		}
		return fsUrlArray;
	}

	private _getFsDirectoryPathArray(fsFullPathArray: string[]) {
		let fsDirectoryArray: string[] = [];
		for (let i = 0; i < fsFullPathArray.length; i++) {
			fsDirectoryArray.push(path.dirname(fsFullPathArray[i]));
		}
		return fsDirectoryArray;
	}

	private _loadConfiguration() {
		if (this._view) {
			// Load configuration
			this._imageWebUrlArray = vscode.workspace.getConfiguration().get('vione.view.imageWebUrlArray') || [""];
			this._transition_time = vscode.workspace.getConfiguration().get('vione.view.transitionTime') || 0;

			if (this._env == "remote") {
				this._imageFsFullPathArray = vscode.workspace.getConfiguration().get('vione.view.imageRemoteFullPathArray') || [""];
			} else {
				this._imageFsFullPathArray = vscode.workspace.getConfiguration().get('vione.view.imageLocalFullPathArray') || [""];
			}
			
			// Compose webviewView.webview.options
			const imageFsDirectoryPathArray: string[] = this._getFsDirectoryPathArray(this._imageFsFullPathArray);
			let localResourceRoots = [this._extensionUri];
			for (let i = 0; i < imageFsDirectoryPathArray.length; i++) {
				localResourceRoots.push(vscode.Uri.file(imageFsDirectoryPathArray[i]))
			}
			this._view.webview.options = {
				// Allow scripts in the webview
				enableScripts: true,
				// Allow to access to local resources in the webview
				localResourceRoots: localResourceRoots
			};

			// Compose imageUrlArray
			this._imageFsUrlArray = this._getFsUrlArray(this._imageFsFullPathArray);
			this._imageUrlArray = this._imageWebUrlArray.concat(this._imageFsUrlArray);

			// Start image
			this._start_image = this._view.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'setting_example_edit.png')).toString();
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
