﻿/*
Copyright 2018 Brian Bosak
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//Set up browser context
if (!Element.prototype.remove) {
    Element.prototype.remove = function () {
        this.parentNode.removeChild(this);
    };
}

function LinkedList()
{
    var head;
    var tail;
    return {
        add: function (value) {
            var node = {value:value};
            if (!head) {
                head = node;
                tail = node;
            } else {
                tail.next = node;
                node.prev = tail;
                tail = node;
            }
            return node;
        },
        remove: function (node) {
            if (node == head) {
                head = head.next;
            }
            if (node == tail) {
                tail = tail.prev;
            }
            if (node.next) {
                node.next.prev = node.prev;
            }
            if (node.prev) {
                node.prev.next = node.next;
            }
            node.next = null;
            node.prev = null;
        },
        first: function () {
            return head;
        }
    };
}

/**
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
                child.parent = retval;
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
            getParent: function () {
                if (widget.parent) {
                    return widget.parent.widget;
                } else {
                    return null;
                }
            },
            remove: function () {
                widget.remove();
                return retval;
            },
            addWidget: function (child) {
                widget.appendChild(child.getPrivateData(key).rawNode);
                return retval;
            },
            getBounds: function () {
                var domNode = widget.node;
                return { x: domNode.offsetLeft, y: domNode.offsetTop, width: domNode.offsetWidth, height: domNode.offsetHeight };
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
                //Re-layout children
                for (var child = widget.firstChild; child != null; child = child.next) {
                    var lw = child.widget;
                    lw.layout();
                }

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
                var parent = grid.getParent();
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
                    var col = cols[i];
                    switch (cols[i].type) {
                        case 0:
                            {
                                col.size = 0;
                            }
                            break;
                        case 1:
                            {
                                col.size = 0;
                            }
                            break;
                    }
                }
                var gridWidth = 0;
                var gridHeight = 0;
                if (parent) {
                    var bounds = parent.getBounds();
                    gridWidth = bounds.width;
                    gridHeight = bounds.height;
                } else {
                    gridWidth = gridDiv.clientWidth;
                    gridHeight = gridDiv.clientHeight;
                }
                var remainingWidth = gridWidth;
                var remainingHeight = gridHeight;
                for (var child = node.firstChild; child != null; child = child.next) {
                    child.node.style.width = '';
                    child.node.style.height = '';
                }
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
                                remainingWidth -= col.size;
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
                                remainingHeight -= row.size;
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
                for (var child = node.firstChild; child != null; child = child.next) {
                    var widget = child.widget;
                    if (widget.rowSpan == 0 || widget.colSpan == 0) {
                        child.node.style.display = 'none'; //Element is invisible (why did the user add an invisible element to the DOM?). Don't render.
                        continue;
                    }
                    var row = rows[widget.y];
                    var col = cols[widget.x];
                    child.node.style.left = col.position + 'px';
                    child.node.style.top = row.position + 'px';
                    var endRow = rows[widget.y + (widget.rowSpan - 1)];
                    var endCol = cols[widget.x + (widget.colSpan - 1)];
                    var computedWidth = (endCol.position + endCol.size)-col.position;
                    var computedHeight = (endRow.position + endRow.size)-row.position;

                    child.node.style.width = computedWidth + 'px';

                    child.node.style.height = computedHeight + 'px';
                    
                }
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