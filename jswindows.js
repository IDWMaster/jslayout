function createWindowManager(app) {
    var rootDiv = document.createElement('div');
    rootDiv.style.width = '100%';
    rootDiv.style.height = '100%';
    var wm = app.createWidget(rootDiv);
    var currentForegroundWindow = null;
    var zlist = [];
    wm.createWindow = function (title) {
        var windowDiv = document.createElement('div');
        var isAdding = true;
        windowDiv.className = "window";
        var isAbsolute = false;
        windowDiv.style.position = 'absolute';
        var windowPriv = {div:windowDiv};
        function makeForeground() {
            if (currentForegroundWindow != windowPriv) {
                if (isAdding) {
                    windowPriv.z = zlist.length;
                    zlist.push(windowPriv);
                } else {
                    for (var i = windowPriv.z; i < zlist.length-1; i++) {
                        //Shift everything over
                        zlist[i] = zlist[i + 1];
                        zlist[i].z = i;
                        zlist[i].div.style.zIndex = i;
                    }
                    windowPriv.z = zlist.length - 1;
                    zlist[windowPriv.z] = windowPriv;
                }
                windowPriv.div.style.zIndex = windowPriv.z;
                currentForegroundWindow = windowPriv;
            }
        };
        makeForeground();
        isAdding = false;
        var titleBar = document.createElement('div');
        titleBar.style.overflow = 'auto';
        titleBar.style.cursor = 'default';
        var isDragging = false;
        var relX = 0;
        var relY = 0;
        var resizeCb = function (evt) { };
        windowDiv.onmousedown = function (evt) {
            makeForeground();
            resizeCb(evt);
        };
        windowDiv.ontouchstart = function () {
            //windowDiv.onmousedown();
        };
        titleBar.onmousedown = function (evt) {
            if (evt.preventDefault) {
                evt.preventDefault();
            }
            makeForeground();
            isDragging = true;
            relX = evt.clientX;
            relY = evt.clientY;
            rootDiv.onmousemove = titleBar.onmousemove;
            rootDiv.ontouchmove = titleBar.ontouchmove;
        };
        var xOffset = 0;
        var yOffset = 0;
        titleBar.onmousemove = function (evt) {
            if (isDragging) {
                if (evt.preventDefault) {
                    evt.preventDefault();
                }
                var x = evt.clientX - relX;
                var y = evt.clientY - relY;
                relX = evt.clientX;
                relY = evt.clientY;
                windowDiv.style.left = (windowDiv.offsetLeft + x) + 'px';
                windowDiv.style.top = (windowDiv.offsetTop + y) + 'px';
                retval.onMove();
            }
        };
        function makeOverlay() {
            var overlay = document.createElement('div');
            rootDiv.appendChild(overlay);
            overlay.style.position = 'fixed';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.zIndex = windowPriv.z + 1;
            return overlay;
        };
        var specialCursorActive = false;
        var resizeSensitivityThreshold = 3;
        var mouseCursorOverlay = null;
        windowDiv.onmousemove = function (evt) {
            if (evt.clientX >= windowDiv.offsetLeft + windowDiv.clientWidth - resizeSensitivityThreshold) {
                windowDiv.style.cursor = 'ew-resize';
                specialCursorActive = true;
                if (!mouseCursorOverlay) {
                    mouseCursorOverlay = makeOverlay();
                }
                mouseCursorOverlay.style.cursor = 'ew-resize';
                var bounds = retval.getBounds();
                mouseCursorOverlay.style.left = bounds.x + 'px';
                mouseCursorOverlay.style.top = bounds.y+'px';
                mouseCursorOverlay.style.width = bounds.width + 'px';
                mouseCursorOverlay.style.height = bounds.height + 'px';
                mouseCursorOverlay.onmousemove = windowDiv.onmousemove;
                mouseCursorOverlay.onmousedown = resizeCb;
                resizeCb = function (evt) {
                    //Create resize overlay
                    if (mouseCursorOverlay) {
                        mouseCursorOverlay.remove();
                        mouseCursorOverlay = null;
                    }
                    var overlay = makeOverlay();
                    overlay.style.cursor = 'ew-resize';
                    var captureStart = evt.clientX;
                    var originalWidth = windowDiv.clientWidth;
                    overlay.onmouseup = function () {
                        overlay.remove();
                        overlay.onmousemove = null;
                    };
                    overlay.onmousemove = function (evt) {
                        retval.setSize(originalWidth-(captureStart - evt.clientX), windowDiv.clientHeight);
                    };
                };
            } else {
                if (evt.clientX <= windowDiv.offsetLeft + resizeSensitivityThreshold) {
                    windowDiv.style.cursor = 'ew-resize';
                    specialCursorActive = true;
                    if (!mouseCursorOverlay) {
                        mouseCursorOverlay = makeOverlay();
                    }
                    mouseCursorOverlay.style.cursor = 'ew-resize';
                    var bounds = retval.getBounds();
                    mouseCursorOverlay.style.left = bounds.x + 'px';
                    mouseCursorOverlay.style.top = bounds.y + 'px';
                    mouseCursorOverlay.style.width = bounds.width + 'px';
                    mouseCursorOverlay.style.height = bounds.height + 'px';
                    mouseCursorOverlay.onmousemove = windowDiv.onmousemove;
                    mouseCursorOverlay.onmousedown = resizeCb;
                    resizeCb = function (evt) {
                        //Create resize overlay
                        if (mouseCursorOverlay) {
                            mouseCursorOverlay.remove();
                            mouseCursorOverlay = null;
                        }
                        var overlay = makeOverlay();
                        overlay.style.cursor = 'ew-resize';
                        var captureStart = evt.clientX;
                        var originalWidth = windowDiv.clientWidth;
                        overlay.onmouseup = function () {
                            overlay.remove();
                            overlay.onmousemove = null;
                        };
                        overlay.onmousemove = function (evt) {
                            var newWidth = originalWidth - (evt.clientX - captureStart);
                            retval.setSize(newWidth, windowDiv.clientHeight);
                            var diff = originalWidth - newWidth;
                            retval.setPosition(bounds.x + diff, bounds.y);
                        };
                    };
                } else {
                    //Y axis
                    if (evt.clientY >= windowDiv.offsetTop + windowDiv.clientHeight - resizeSensitivityThreshold) {
                        windowDiv.style.cursor = 'ns-resize';
                        specialCursorActive = true;
                        if (!mouseCursorOverlay) {
                            mouseCursorOverlay = makeOverlay();
                        }
                        mouseCursorOverlay.style.cursor = 'ns-resize';
                        var bounds = retval.getBounds();
                        mouseCursorOverlay.style.left = bounds.x + 'px';
                        mouseCursorOverlay.style.top = bounds.y + 'px';
                        mouseCursorOverlay.style.width = bounds.width + 'px';
                        mouseCursorOverlay.style.height = bounds.height + 'px';
                        mouseCursorOverlay.onmousemove = windowDiv.onmousemove;
                        mouseCursorOverlay.onmousedown = resizeCb;
                        resizeCb = function (evt) {
                            //Create resize overlay
                            if (mouseCursorOverlay) {
                                mouseCursorOverlay.remove();
                                mouseCursorOverlay = null;
                            }
                            var overlay = makeOverlay();
                            overlay.style.cursor = 'ns-resize';
                            var captureStart = evt.clientY;
                            var originalHeight = windowDiv.clientHeight;
                            overlay.onmouseup = function () {
                                overlay.remove();
                                overlay.onmousemove = null;
                            };
                            overlay.onmousemove = function (evt) {
                                retval.setSize(windowDiv.clientWidth, originalHeight - (captureStart - evt.clientY));
                            };
                        };
                    } else {
                        if (evt.clientY <= windowDiv.offsetTop + resizeSensitivityThreshold) {
                            windowDiv.style.cursor = 'ns-resize';
                            specialCursorActive = true;
                            if (!mouseCursorOverlay) {
                                mouseCursorOverlay = makeOverlay();
                            }
                            mouseCursorOverlay.style.cursor = 'ns-resize';
                            var bounds = retval.getBounds();
                            mouseCursorOverlay.style.left = bounds.x + 'px';
                            mouseCursorOverlay.style.top = bounds.y + 'px';
                            mouseCursorOverlay.style.width = bounds.width + 'px';
                            mouseCursorOverlay.style.height = bounds.height + 'px';
                            mouseCursorOverlay.onmousemove = windowDiv.onmousemove;
                            resizeCb = function (evt) {
                                //Create resize overlay
                                if (mouseCursorOverlay) {
                                    mouseCursorOverlay.remove();
                                    mouseCursorOverlay = null;
                                }
                                var overlay = makeOverlay();
                                overlay.style.cursor = 'ns-resize';
                                var captureStart = evt.clientY;
                                var originalHeight = windowDiv.clientHeight;
                                overlay.onmouseup = function () {
                                    overlay.remove();
                                    overlay.onmousemove = null;
                                };
                                overlay.onmousemove = function (evt) {
                                    var newHeight = originalHeight - (evt.clientY - captureStart);
                                    retval.setSize(windowDiv.clientWidth, newHeight);
                                    var diff = originalHeight - newHeight;
                                    retval.setPosition(bounds.x, bounds.y + diff);
                                };
                            };
                            mouseCursorOverlay.onmousedown = resizeCb;
                        } else {
                            if (specialCursorActive) {
                                mouseCursorOverlay.remove();
                                mouseCursorOverlay = null;
                                specialCursorActive = false;
                                resizeCb = function (evt) { };
                                windowDiv.style.cursor = '';
                            }
                        }
                    }
                }

                
            }
        };
        titleBar.onmouseup = function () {
            isDragging = false;
            rootDiv.onmousemove = null;
            rootDiv.ontouchmove = null;
        };
        var touchDispatchTable = {};
        titleBar.ontouchstart = function (evt) {
            titleBar.onmousedown(evt.targetTouches[0]);
            touchDispatchTable[evt.targetTouches[0].identifier] = titleBar;
            if (evt.target == titleBar) {
                evt.preventDefault();
            }
        };
        titleBar.ontouchend = function (evt) {
            delete touchDispatchTable[evt.changedTouches[0].identifier];
            titleBar.onmouseup(evt);
            if (evt.target == titleBar) {
                evt.preventDefault();
            }
        };
        titleBar.ontouchmove = function (evt) {
            for (var i = 0; i < evt.touches.length; i++) {
                var touch = evt.touches[i];
                if (touchDispatchTable[touch.identifier]) {
                    touchDispatchTable[touch.identifier].onmousemove(touch);
                }
            }
            
        };
        titleBar.className = "window-titlebar";
        titleBar.innerText = title;
        windowDiv.appendChild(titleBar);
        var closeBtn = document.createElement('input');
        closeBtn.type = 'button';
        closeBtn.value = 'X';
        closeBtn.onclick = function (evt) {
            retval.remove();
        };

        closeBtn.onmousedown = function (evt) {
            evt.stopPropagation();
        };
        titleBar.appendChild(closeBtn);
        closeBtn.style.cssFloat = 'right';
        var windowBody = document.createElement('div');
        windowBody.className = "window-body";
        windowBody.style.width = '100%';
        windowBody.style.height = '100%';
        windowDiv.appendChild(windowBody);
        windowBody.style.overflow = 'auto';
        windowBody.style.position = 'relative';
        rootDiv.appendChild(windowDiv);
        var retval = app.createWidget(windowBody);
        retval.getZIndex = function () {
            return windowPriv.z || 0;
        };
        retval.getBounds = function () {
            return { x: windowDiv.offsetLeft, y: windowDiv.offsetTop, width: windowDiv.clientWidth, height: windowDiv.clientHeight };
        };
        var realRemove = retval.remove;
        retval.remove = function () {
            zlist.splice(windowPriv.z, 1);
            for (var i = windowPriv.z; i < zlist.length; i++) {
                zlist[i].z = i;
                zlist[i].div.style.zIndex = i;
            }
                windowDiv.remove();
            retval.onClose();
        };
        retval.onClose = function () {
            
        };
        retval.onMove = function (x,y) {
            
        };
        retval.onResize = function (width, height) {
            
        };
        retval.setCloseEnabled = function(enabled) {
            if (enabled) {
                closeBtn.style.display = '';
            } else {
                closeBtn.style.display = 'none';
            }
        };
        retval.setPosition = function (x, y) {
            
                windowDiv.style.left = x + 'px';
                windowDiv.style.top = y + 'px';
            retval.onMove();
        };
        retval.setSize = function (width, height) {
            windowDiv.style.width = width + 'px';
            windowDiv.style.height = height + 'px';
            retval.onResize();
        };
        return retval;
    };
    return wm;
}