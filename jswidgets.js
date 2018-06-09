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
            getPrivateData(ikey) {
                if (ikey == key) {
                    return privateData;
                }
                return null;
            }
        };
        return retval;
    };
    var appNode = createWidget(createNode(rootNode));
    var app = {
        createWidget: function (node) {
            return createWidget(createNode(node));
        },
        root:appNode
    };
    return app;
}
