 Object.prototype.addReadonlyProperty = function (name, value) {
            var thisptr = this;
            if (name == undefined) {
                return;
            }
            var val = value;
            Object.defineProperty(this, name, {
                get: function () {
                    return val;
                }
            });
        };
        Object.prototype.addObservableProperty = function (name, initialValue) {
            var thisptr = this;
            if (name == undefined) {
                return;
            }
            var val = initialValue;
            var handlers = new Array();
            Object.defineProperty(this, name, {
                get: function () {
                    return val;
                },
                set: function (value) {
                    val = value;
                    for (var i = 0; i < handlers.length; i++) {
                        var r = handlers[i]();
                        if (r != undefined) {
                            if (!r) {
                                break;
                            }
                        }
                    }
                }
            });
            return {
                addListener: function (handler) {
                    handlers.push(handler.bind(thisptr));
                }
            };
        };
        var layoutGrid = function (grid) {
            
            var rows = grid.find('.RowDefinition');
            var columns = grid.find('.ColumnDefinition');
            rows.hide();
            var gridHeight = grid.innerHeight();
            var gridWidth = grid.innerWidth();


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
                            tval += columnLayout[x+c];
                        }
                        child.width(tval);
                    }
                }
            };

            layoutRows();
            layoutColumns();


        };
        var initLayout = function () {
            var app = $('.Application');
            app.children().css('width', '100%').css('height', '100%');
            var grids = app.find('.Grid');
            

            for (var i = 0; i < grids.length; i++) {
                var grid = $(grids[i]);
                layoutGrid(grid);
            }

            
        };
        $(document).ready(function () {
            initLayout();
        });