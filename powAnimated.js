var createScene = async function () {
    var scene = new BABYLON.Scene(engine);

    // 1. Setup Environment
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    
    // 2. Image Assets (Direct Links)
    var imageURLs = [
        "https://i.imgur.com/I9KRaQP.png", 
        "https://i.imgur.com/2F7DxDo.png", 
        "https://i.imgur.com/4ByfeUt.png"  
    ];
    
    var textures = imageURLs.map(url => {
        var tex = new BABYLON.Texture(url, scene);
        tex.hasAlpha = true;
        return tex;
    });
    var currentImageIndex = 0;

    // 3. The Comic Mesh
    var comicPlane = BABYLON.MeshBuilder.CreatePlane("pop", { size: 1 }, scene);
    comicPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    comicPlane.isVisible = false; 
    
    var material = new BABYLON.StandardMaterial("popMat", scene);
    material.useAlphaFromDiffuseTexture = true;
    comicPlane.material = material;

    // 4. Animation Logic
    var isPopped = false;
    var currentScale = 0;

    scene.registerBeforeRender(() => {
        if (isPopped) {
            if (currentScale < 1) {
                currentScale += 0.08; 
                var s = currentScale * 5; 
                comicPlane.scaling.set(s, s, s);
            } else if (material.alpha > 0) {
                material.alpha -= 0.03; 
            } else {
                isPopped = false;
                comicPlane.isVisible = false;
            }
        }
    });

    // 5. WebXR AR Setup
    try {
        await scene.createDefaultXRExperienceAsync({
            uiOptions: { sessionMode: 'immersive-ar' }
        });
    } catch (e) {
        console.log("AR not supported on this device.");
    }

    // 6. Interaction
    scene.onPointerDown = (evt, pickResult) => {
        comicPlane.isVisible = true;
        isPopped = true;
        currentScale = 0;
        material.alpha = 1;

        if (pickResult.hit) {
            comicPlane.position.copyFrom(pickResult.pickedPoint);
        }

        material.diffuseTexture = textures[currentImageIndex];
        currentImageIndex = (currentImageIndex + 1) % textures.length;
    };

    return scene; // This must be here!
};