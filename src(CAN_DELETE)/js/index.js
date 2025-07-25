(function () {
    let config = JSON.parse(`{"resolution":{"designWidth":640,"designHeight":1030,"scaleMode":"fixedheight","alignV":"top","alignH":"left","screenMode":"horizontal","backgroundColor":"#888888"},"physics2D":{"drawCenterOfMass":true,"layers":["Default","Head","Food","Wall","Body"],"allowSleeping":true,"gravity":{"x":0,"y":9.8},"velocityIterations":8,"positionIterations":3,"pixelRatio":50,"debugDraw":false,"drawShape":true,"drawJoint":true,"drawAABB":false},"splash":{"fit":"center","enabled":true,"duration":1},"2D":{"FPS":60,"isAntialias":true,"useRetinalCanvas":false,"isAlpha":false,"webGL2D_MeshAllocMaxMem":true,"defaultFont":"SimSun","defaultFontSize":20},"3D":{"enableDynamicBatch":true,"defaultPhysicsMemory":16,"enableUniformBufferObject":true,"pixelRatio":1,"enableMultiLight":true,"maxLightCount":32,"lightClusterCount":{"x":12,"y":12,"z":12},"maxMorphTargetCount":32},"physics3D":{"fixedTimeStep":0.016666666666666666,"maxSubSteps":1,"enableCCD":false,"ccdThreshold":0.0001,"ccdSphereRadius":0.0001,"layers":["Default"]},"addons":{},"physics3dModule":"laya.bullet","physics2dModule":"laya.box2D","spineVersion":"3.8","stat":false,"vConsole":false,"alertGlobalError":false,"startupScene":"Scene.ls","useSafeFileExtensions":true,"bpConfigPath":"internal/blueprint.bin","pkgs":[{"path":"","autoLoad":true}]}`);
    Object.assign(Laya.PlayerConfig, config);
    Object.assign(Laya.Config, config["2D"]);
    Object.assign(Laya.Config3D, config["3D"]);

    let v3 = Laya.Config3D.lightClusterCount;
    Laya.Config3D.lightClusterCount = new Laya.Vector3(v3.x, v3.y, v3.z);

    if (typeof (window) === "undefined")
        window = {};

    if (config.useSafeFileExtensions)
        Laya.URL.initMiniGameExtensionOverrides();

    let pkgs = [];
    for (let pkg of config.pkgs) {
        let path = pkg.path.length > 0 ? (pkg.path + "/") : pkg.path;
        if (pkg.hash)
            Laya.URL.version[path + "fileconfig.json"] = pkg.hash;
        if (pkg.remoteUrl) {
            let remoteUrl = pkg.remoteUrl.endsWith("/") ? pkg.remoteUrl : (pkg.remoteUrl + "/");
            if (path.length > 0)
                Laya.URL.basePaths[path] = remoteUrl;
            else
                Laya.URL.basePath = remoteUrl;
        }

        if (pkg.autoLoad)
            pkgs.push(pkg);
    }

    Laya.init(config.resolution).then(() => {
        if (config.vConsole && (Laya.Browser.onMobile || Laya.Browser.onIPad) && !Laya.LayaEnv.isConch) {
            let script = document.createElement("script");
            script.src = "js/vConsole.min.js";
            script.onload = () => {
                window.vConsole = new VConsole();
            };
            document.body.appendChild(script);
        }

        if (config.alertGlobalError)
            Laya.alertGlobalError(true);
        if (config.debug || Laya.Browser.getQueryString("debug") == "true")
            Laya.enableDebugPanel();
        if (config.stat)
            Laya.Stat.show();

        return Promise.all(pkgs.map(pkg => Laya.loader.loadPackage(pkg.path, pkg.remoteUrl)));
    }).then(() => {
        if (window.$_main_)
            return window.$_main_();
        else if (config.startupScene) {
            return Laya.Scene.open(config.startupScene, true, null, null, Laya.Handler.create(null, (progress) => {
                if (window.onSplashProgress)
                    window.onSplashProgress(progress);
            }, null, false));
        }
    }).then(() => {
        if (window.hideSplashScreen)
            window.hideSplashScreen();
    });
})();
