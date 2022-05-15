//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();
    const oldState = vscode.getState();
    const imageURLs = [
        'https://downloads.fanbox.cc/images/post/3802639/irk3hJmEJNmiT5AUU8pebQ4m.png',
        'https://downloads.fanbox.cc/images/post/3802639/xNc5Ai83w5ZwALhSIjh8E8y3.png'
    ];

    var imageURL = oldState.imageURL;
    var index = imageURLs.indexOf(imageURL);
    var elem = document.getElementById("image_0");

    updateURLList(imageURL);

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'updateImage':
                {
                    nextURLList(imageURL)
                    break;
                }

        }
    });

    /**
     * @param {string} imageURL
     */
    function updateURLList(imageURL) {
        // @ts-ignore
        elem.src = imageURL;
        vscode.setState({ imageURL: imageURL });
    }

    /**
     * @param {any} imageURL
     */
    function nextURLList(imageURL) {
        if (index >= imageURLs.length - 1) {
            index = 0;
        } else {
            index += 1;
        }
        imageURL = imageURLs[index];
        updateURLList(imageURL);
    }
}());


