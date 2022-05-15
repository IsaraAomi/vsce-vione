//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();
    const images = [
        'https://downloads.fanbox.cc/images/post/3802639/irk3hJmEJNmiT5AUU8pebQ4m.png',
        'https://downloads.fanbox.cc/images/post/3802639/xNc5Ai83w5ZwALhSIjh8E8y3.png'
    ];

    var index = 0;
    var elem = document.getElementById("image_0");
    var image = images[index];

    setSource(image);

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'updateImage':
                {
                    updateImage(image);
                    break;
                }
        }
    });

    /**
     * @param {string} image
     */
    function setSource(image) {
        // @ts-ignore
        elem.src = image;
        vscode.setState({ image: image });
    }

    /**
     * @param {any} image
     */
    function updateImage(image) {
        if (index >= images.length - 1) {
            index = 0;
        } else {
            index += 1;
        }
        image = images[index];
        setSource(image);
    }
}());


