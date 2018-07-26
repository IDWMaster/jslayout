/*
Copyright 2018 Brian Bosak
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/**
 * Creates an AutoComplete instance
 * @param {HTMLInputElement} textInput The input to provide auto-complete support to
 */
function createAutoComplete(app, textInput) {
    var div = document.createElement('div');
    var retval = app.createWidget(div);
    textInput.parentNode.appendChild(div);
    div.style.display = 'none';
    div.style.position = 'absolute';
    div.className = 'autocomplete-list';
    var prevLayout = retval.layout;
    var prevKeyPress = textInput.onkeydown;
    var currentSelection = null;
    retval.onsubmit = function (selection) { };
    textInput.onkeydown = function (evt) {
        if (prevKeyPress) {
            if (prevKeyPress(evt) == false) {
                return false;
            }
        }
        if (evt.keyCode == 13) {
            //Accept search result
            var selection = currentSelection;
            if (!selection) {
                selection = div.firstChild;
            }
            retval.hide();
            retval.onsubmit(selection);
        }
        if (evt.keyCode == 40) {
            //Move down
            if (div.firstChild == null) {
                return;
            }
            if (!currentSelection) {
                currentSelection = div.firstChild;
            } else {
                if (currentSelection.nextSibling) {
                    currentSelection.className = '';
                    currentSelection = currentSelection.nextSibling;
                }
            }
            currentSelection.className = 'autocomplete-selected';
            evt.preventDefault();
        }
        if (evt.keyCode == 38) {
            //Move up
            if (!currentSelection) {
                return;
            }
            currentSelection.className = '';
            currentSelection = currentSelection.previousSibling;
            if (currentSelection) {
                currentSelection.className = 'autocomplete-selected';
            }
            evt.preventDefault();
        }
    };
    retval.layout = function () {
        div.style.left = textInput.offsetLeft + 'px';
        div.style.top = textInput.offsetTop + textInput.offsetHeight + 'px';
        div.style.width = textInput.offsetWidth + 'px';
        prevLayout();
    };
    retval.show = function () {
        retval.layout();
        currentSelection = null;
        div.style.display = '';
    };
    retval.hide = function () {
        div.style.display = 'none';
    };
    return retval;
};