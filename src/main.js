//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();
    const start_image = "https://github.com/IsaraAomi/vsce-vione/blob/master/media/setting_example_edit.png?raw=true"
    
    var images = [start_image];    
    const oldState = vscode.getState() || { image: images[0], interval_time: 0 };
    var interval_time = oldState.interval_time;
    var image = oldState.image;
    var index = images.indexOf(image);
    var elem = document.getElementById("image_0");

    setSource(image);

    // var element = document.getElementById("sample");
    // element.innerHTML = interval_time.toString();

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'nextImage':
                {
                    images = message.images;
                    nextImage(images);
                    break;
                }
            case 'updateImagesList':
                {
                    images = message.images;
                    setSource(images[0]);
                    break;
                }
            case 'setTransitionTime':
                {
                    interval_time = message.time;
                    // element.innerHTML = interval_time.toString();
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
            elem.title = image;
        } else {
            // @ts-ignore
            elem.src = start_image;
        }
        vscode.setState({ image: image, interval_time: interval_time });
    }

    /**
     * @param {string[]} images
     */
    function nextImage(images) {
        if (index >= images.length - 1) {
            index = 0;
        } else {
            index += 1;
        }
        image = images[index];
        setSource(image);
    }
}());

