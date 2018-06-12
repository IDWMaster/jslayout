﻿/**
 * Creates a JSWidgets application
 * @param {HTMLElement} rootNode The node to initialize the application in
 */
function createApplication(rootNode) {
    var key = {};
    /**
     * Creates a wrapper around a DOM node
     * @param {HTMLElement} domNode The node to create the wrapper around
     */
    function createNode(domNode) {
        var retval = {
            next: null,
            prev: null,
            firstChild: null,
            lastChild: null,
            parent: null,
            node:domNode,
            appendChild: function (child) {
                if (retval.firstChild == null) {
                    retval.firstChild = child;
                    retval.lastChild = child;
                } else {
                    retval.lastChild.next = child;
                    child.prev = retval.lastChild;
                    retval.lastChild = child;
                }
                retval.node.appendChild(child.node);
            },
            remove: function () {
                if (retval.parent == null) {
                    throw 'No parent to remove from.';
                }
                retval.node.remove();
                if (retval.prev) {
                    retval.prev.next = retval.next;
                }
                if (retval.next) {
                    retval.next.prev = retval.prev;
                }
                if (retval.parent.firstChild == retval) {
                    retval.parent.firstChild = retval.next;
                }
                if (retval.parent.lastChild == retval) {
                    retval.parent.lastChild = retval.prev;
                }
                retval.parent = null;
                retval.next = null;
                retval.prev = null;
            }
        };

        return retval;
    };
    function createWidget(widget) {
        var privateData = {
            rawNode:widget
        };
        var retval = {
            getDomNode: function () {
                return widget.node;
            },
            remove: function () {
                widget.remove();
                return retval;
            },
            addWidget: function (child) {
                widget.appendChild(child.getPrivateData(key).rawNode);
                return retval;
            },
            getPrivateData: function(ikey) {
                if (ikey == key) {
                    return privateData;
                }
                return null;
            },
            getFirstChild: function () {
                return widget.firstChild.widget;
            },
            getNext: function () {
                return widget.next.widget;
            },
            layout: function ()
            {
                //Does nothing by default.
            }
        };

        widget.widget = retval;
        return retval;
    };
    var appNode = createWidget(createNode(rootNode));
    var app = {
        createWidget: function (node) {
            return createWidget(createNode(node));
        },
        createGrid: function () {
            var gridDiv = document.createElement('div');
            var rows = [];
            var cols = [];
            gridDiv.style.width = '100%';
            gridDiv.style.height = '100%';
            var node = createNode(gridDiv);
            var grid = createWidget(node);
            var realAddWidget = grid.addWidget;
            var fullColumnCount = 0;
            var fullRowCount = 0;
            grid.addWidgetWithSpan = function (widget, x, y, colSpan, rowSpan) {
                realAddWidget(widget);
                widget.x = x;
                widget.y = y;
                widget.colSpan = colSpan;
                widget.rowSpan = rowSpan;
                widget.getPrivateData(key).rawNode.node.style.position = 'absolute';
                return grid;
            };
            grid.addAutoRow = function () {
                rows.push({ type: 0, size: 0, position:0 });
                return grid;
            };
            grid.addFullRow = function () {
                fullRowCount++;
                rows.push({ type: 1, size: 0, position: 0 });
                return grid;
            };
            grid.addRow = function (height) {
                rows.push({ type: 2, size: height, position: 0 });
                return grid;
            };

            grid.addAutoColumn = function () {
                cols.push({ type: 0, size: 0, position: 0 });
                return grid;
            };
            grid.addFullColumn = function () {
                fullColumnCount++;
                cols.push({ type: 1, size: 0, position: 0 });
                return grid;
            };
            grid.addColumn = function (width) {
                cols.push({ type: 2, size: width, position: 0 });
                return grid;
            };
            grid.addWidget = function (widget, x, y) {
                grid.addWidgetWithSpan(widget, x, y, 1, 1);
                return grid;
            };
            var prevLayout = grid.layout;
            grid.layout = function () {
                prevLayout();
                for (var i = 0; i < rows.length; i++) {
                    switch (rows[i].type) {
                        case 0:
                            {
                                rows[i].size = 0;
                            }
                            break;
                        case 1:
                            {
                                rows[i].size = 0;
                            }
                            break;
                    }
                }
                for (var i = 0; i < cols.length; i++) {
                    switch (cols[i].type) {
                        case 0:
                            {
                                cols[i].size = 0;
                            }
                            break;
                        case 1:
                            {
                                cols[i].size = 0;
                            }
                            break;
                    }
                }
                var gridWidth = gridDiv.offsetWidth;
                var gridHeight = gridDiv.offsetHeight;
                var remainingWidth = gridWidth;
                var remainingHeight = gridHeight;
                for (var child = node.firstChild; child != null; child = child.next) {
                    var widget = child.widget;
                    var row = rows[widget.y];
                    var col = cols[widget.x];
                    var width = child.node.offsetWidth;
                    var height = child.node.offsetHeight;
                    
                    switch (col.type) {
                        case 0:
                            {
                                //Auto size
                                if (width > col.size) {
                                    remainingWidth -= (width-col.size);
                                    col.size = width;
                                }
                            }
                            break;
                        case 1:
                            {
                                //Take up all remaining space (computed on subsequent passes)
                                
                            }
                            break;
                        case 2:
                            {
                                //Defer update
                            }
                            break;
                    }
                    switch (row.type) {
                        case 0:
                            {
                                //Auto size
                                if (height > row.size) {
                                    remainingHeight -= (height - row.size);
                                    row.size = height;
                                }
                            }
                            break;
                        case 1:
                            {
                                //Take up all remaining space (computed on subsequent passes)
                                
                            }
                            break;
                        case 2:
                            {
                                //Defer update
                            }
                            break;
                    }
                }



                var singleWidth = remainingWidth / fullColumnCount;
                var singleHeight = remainingHeight / fullRowCount;


                //Second pass (assign position/size to rows,columns)
                var cx = 0;
                var cy = 0;
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    row.position = cy;
                    switch (row.type) {
                        case 0:
                            {
                                //Auto-size (precomputed above)
                                cy += row.size;
                            }
                            break;
                        case 1:
                            {
                                //Take up remaining space
                                row.size = singleHeight;
                                cy += singleHeight;
                            }
                            break;
                        case 2:
                            {
                                //Hardcoded size
                                cy += row.size;
                            }
                            break;
                    }
                }
                
                for (var i = 0; i < cols.length; i++) {
                    var col = cols[i];
                    col.position = cx;
                    switch (col.type) {
                        case 0:
                            {
                                //Auto-size (precomputed above)
                                cx += col.size;
                            }
                            break;
                        case 1:
                            {
                                //Take up remaining space
                                col.size = singleWidth;
                                cx += singleWidth;
                            }
                            break;
                        case 2:
                            {
                                //Hardcoded size
                                cx += col.size;
                            }
                            break;
                    }
                }

                //Write to DOM (batch operations)
                node.node.style.display = 'none'; //Batch layout operations so we aren't thrashing the browser's layout engine
                for (var child = node.firstChild; child != null; child = child.next) {
                    var widget = child.widget;
                    var row = rows[widget.y];
                    var col = cols[widget.x];
                    child.node.style.left = col.position + 'px';
                    child.node.style.top = row.position + 'px';
                    if (col.type != 0) {
                        child.node.style.width = col.size + 'px';
                    }
                    if (row.type != 0) {
                        child.node.style.height = row.size + 'px';
                    }
                }
                node.node.style.display = '';
                //Perform layout of inner widgets
                for (var child = node.firstChild; child != null; child = child.next) {
                    var widget = child.widget;
                    widget.layout();
                }
                return grid;
            };
            return grid;
        },
        root:appNode
    };
    return app;
}