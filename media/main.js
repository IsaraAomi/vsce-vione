//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();
    const start_image = "https://github.com/IsaraAomi/vsce-vione/blob/master/media/setting_example_edit.png?raw=true"
    
    var images;
    var interval_time;
    var image;
    var index;
    var elem = document.getElementById("image_0");

    // var element = document.getElementById("sample");
    // var num = 666;
    // element.innerHTML = num.toString();

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'initilize':
                {
                    // var num = message.time;
                    // element.innerHTML = num.toString();
                    images = message.images;
                    interval_time = message.time;
                    if (images.length == 0) {
                        images = [start_image];
                    }
                    const oldState = vscode.getState() || { image: images[0] };
                    image = oldState.image
                    index = images.indexOf(image)
                    setSource(image);
                    break;
                }
            case 'nextImage':
                {
                    images = message.images;
                    if (images.length == 0) {
                        images = [start_image];
                    }
                    nextImage(images);
                    break;
                }
            case 'updateImagesList':
                {
                    images = message.images;
                    if (images.length == 0) {
                        images = [start_image];
                    }
                    setSource(images[0]);
                    break;
                }
            case 'setTransitionTime':
                {                 
                    // var num = message.time;
                    // element.innerHTML = num.toString();
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
        elem.title = image;
        vscode.setState({ image: image });
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


