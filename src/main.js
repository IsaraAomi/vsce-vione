//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();
    const start_image = "https://github.com/IsaraAomi/vsce-vione/blob/master/media/setting_example_edit.png?raw=true"
    
    var images = [start_image];    
    const oldState = vscode.getState() || { image: images[0] };

    var image = oldState.image;
    var index = images.indexOf(image);
    var elem = document.getElementById("image_0");

    setSource(image);

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'updateImage':
                {
                    images = message.images;
                    updateImage(image, images);
                    break;
                }
        }
    });

    /**
     * @param {string} image
     */
    function setSource(image) {
        if (image) {
            // @ts-ignore
            elem.src = image;
        } else {
            // @ts-ignore
            elem.src = start_image;
        }
        vscode.setState({ image: image });
    }

    /**
     * @param {string} image
     * @param {string[]} images
     */
    function updateImage(image, images) {
        if (index >= images.length - 1) {
            index = 0;
        } else {
            index += 1;
        }
        image = images[index];
        setSource(image);
    }
}());


