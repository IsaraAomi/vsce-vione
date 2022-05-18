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
    var interval_time = 0;

    setSource(image);
    // doLoop(interval_time);

    // var element = document.getElementById("sample");
    // var num = 666;
    // element.innerHTML = num.toString();

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'initilize':
                {
                    images = message.images;
                    interval_time = message.time;
                    if (images.length == 0) {
                        images = [start_image];
                    }
                    const oldState = vscode.getState() || { image: images[0] };
                    image = oldState.image
                    index = images.indexOf(image)
                    setSource(image);
                    // doLoop(interval_time);
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
                    interval_time = message.time;
                    // doLoop(interval_time);
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

    /**
     * @param {number} time
     */
    function sleep (time) {
        return new Promise(resolve => {
            setTimeout(resolve, time)
        })
    }

    /**
     * @param {number} local_interval_time
     */
    async function doLoop (local_interval_time) {
        for (let i = 0; ; i++) {
            // element.innerHTML = (local_interval_time * i).toString();
            await sleep(local_interval_time * 1000)
            if (local_interval_time < 1 || local_interval_time != interval_time) {
                break;
            }
            nextImage(images);
        }
    }
}());


