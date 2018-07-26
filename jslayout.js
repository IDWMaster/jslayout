/*
Copyright 2018 Brian Bosak
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


function IDWLayoutInit() {
    var forallChildren = function (node, fn) {
        var running = true;
        var initNode = node;
        var visit = function (node) {
            
            if (running) {
                if (node == initNode) {

                } else {
                    if (fn(node) == false) {
                        running = false;
                        return;
                    }
                }
                var kids = $(node).children();
                for (var i = 0; i < kids.length; i++) {
                    visit(kids[i]);
                }
            };
        };
        visit(node);
    };
    
    var removeIndirectNodes = function (query, parent) {
        for (var i = 0; i < query.length; i++) {
            if ($(query[i]).parent()[0] != parent[0]) {
                query.splice(i, 1);
            }
        }
    }
    var layoutGrid = function (grid) {

        var rows = new Array();
        var columns = new Array();
        removeIndirectNodes(rows, grid);
        removeIndirectNodes(columns, grid);
        for (var i = 0; i < grid[0].children.length; i++) {
            if($(grid[0].children[i]).hasClass('RowDefinition')) {
                rows.push(grid[0].children[i]);
            }
            if ($(grid[0].children[i]).hasClass('ColumnDefinition')) {
                columns.push(grid[0].children[i]);
            }

        }
        rows = $(rows);
        columns = $(columns);
        rows.hide();
        columns.hide();
        var gridHeight = grid.innerHeight();
        var gridWidth = grid.innerWidth();
        grid.children().css('height', '');
        grid.children().css('width', '');
        

        var layoutRows = function () {
            var rowLayout = new Array(); //Size of each row
            for (var i = 0; i < rows.length; i++) {
                rowLayout.push(0);
            }
            var autoRows = new Array();
            var starRows = new Array();
            var totalHeight = 0;
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].innerHTML == 'Auto') {
                    autoRows.push(i);
                } else {
                    if (rows[i].innerHTML == '*') {
                        starRows.push(i);
                    } else {
                        rowLayout[i] = rows[i].innerHTML * 1;
                        totalHeight += rows[i].innerHTML * 1;
                    }
                }
            }


            for (var i = 0; i < autoRows.length; i++) {
                //Get all children in row
                var children = grid.children();
                var rowID = autoRows[i];
                for (var c = 0; c < children.length; c++) { //how C++ was invented
                    if ($(children[c]).attr('y') == rowID) {
                        var child = $(children[c]);
                        if (child.outerHeight(true) > rowLayout[rowID]) {
                            rowLayout[rowID] = child.outerHeight(true);
                        }
                    }
                }

                totalHeight += rowLayout[autoRows[i]];
            }

            var starSize = gridHeight - totalHeight;
            for (var i = 0; i < starRows.length; i++) {
                //Compute space that is available between the previous row and the next one
                rowLayout[starRows[i]] = starSize;
                for (var c = 0; c < i; c++) {
                    rowLayout[starRows[c]] /= 2;
                }
                starSize /= 2;

            }


            var rowPositions = new Array();
            var cm = 0;
            for (var i = 0; i < rowLayout.length; i++) {
                rowPositions.push(cm);
                cm += rowLayout[i];
            }

            for (var i = 0; i < grid.children().length; i++) {
                var child = $(grid.children()[i]);
                if (child.attr('y')) {
                    child.css('height', rowLayout[child.attr('y') * 1]);
                    child.css('position', 'absolute');
                    child.css('top', rowPositions[child.attr('y') * 1]);
                }
                if (child.attr('y-span')) {
                    var span = child.attr('y-span');
                    var tval = 0;
                    var y = child.attr('y') * 1;
                    for (var c = 0; c < span; c++) {
                        tval += rowLayout[y + c];
                    }
                    child.height(tval);
                }
            }
        };
        var layoutColumns = function () {
            var columnLayout = new Array(); //Size of each column
            for (var i = 0; i < columns.length; i++) {
                columnLayout.push(0);
            }
            var autocolumns = new Array();
            var starcolumns = new Array();
            var totalwidth = 0;
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].innerHTML == 'Auto') {
                    autocolumns.push(i);
                } else {
                    if (columns[i].innerHTML == '*') {
                        starcolumns.push(i);
                    } else {
                        columnLayout[i] = columns[i].innerHTML * 1;
                        totalwidth += columns[i].innerHTML * 1;
                    }
                }
            }


            for (var i = 0; i < autocolumns.length; i++) {
                //Get all children in column
                var children = grid.children();
                var columnID = autocolumns[i];
                for (var c = 0; c < children.length; c++) { //how C++ was invented
                    if ($(children[c]).attr('x') == columnID) {
                        var child = $(children[c]);
                        if (child.outerWidth(true) > columnLayout[columnID]) {
                            columnLayout[columnID] = child.outerWidth(true);
                        }
                    }
                }

                totalwidth += columnLayout[autocolumns[i]];
            }

            var starSize = gridWidth - totalwidth;
            for (var i = 0; i < starcolumns.length; i++) {
                //Compute space that is available between the previous column and the next one
                columnLayout[starcolumns[i]] = starSize;
                for (var c = 0; c < i; c++) {
                    columnLayout[starcolumns[c]] /= 2;
                }
                starSize /= 2;

            }


            var columnPositions = new Array();
            var cm = 0;
            for (var i = 0; i < columnLayout.length; i++) {
                columnPositions.push(cm);
                cm += columnLayout[i];
            }

            for (var i = 0; i < grid.children().length; i++) {
                var child = $(grid.children()[i]);
                if (child.attr('x')) {
                    child.css('width', columnLayout[child.attr('x') * 1]);
                    child.css('position', 'absolute');
                    child.css('left', columnPositions[child.attr('x') * 1]);
                }
                if (child.attr('x-span')) {
                    var span = child.attr('x-span');
                    var tval = 0;
                    var x = child.attr('x') * 1;
                    for (var c = 0; c < span; c++) {
                        tval += columnLayout[x + c];
                    }
                    child.width(tval);
                }
            }
        };

        layoutRows();
        layoutColumns();
        var children = grid.children();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.layout) {
                child.layout();
            }
        }

    };


    var Plugins = [function (app) {
        //Grid plugin
        app.hookClass('Grid', function (instance) {
            var i = $(instance);
            instance.layout = function () {
                layoutGrid(i);
            };
            layoutGrid(i);
        });
    }];


    var initLayout = function () {
        var app = $('.Application');
        app.hookClass = function (classname, callback) {
            var query = $('.' + classname);
            for (var i = 0; i < query.length; i++) {
                callback(query[i]);
            }
        };
        app.children().css('width', '100%').css('height', '100%');
        for (var i = 0; i < Plugins.length; i++) {
            Plugins[i](app);
        }
        app[0].layout = function () {
            forallChildren(app[0], function (node) {
                if (node.layout) {
                    node.layout();
                }
            });
        };

        $(window).resize(function () {
            forallChildren(app[0], function (node) {
                if (node.layout) {
                    node.layout();
                }
            });
        });
        


    };
    initLayout();
};