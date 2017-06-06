
/*
**  An implementation of Conway's Game of Life
**  Joshua A. Lemli
**  2017-06-05
*/

'use strict';

var Cgol = (function(){

    var canvas = null;
    var context = null;

    var board = {};
    var lifeEdge = 10;
    var xMax = 0;
    var yMax = 0;

    var iteration = 0;
    var animation = false;
    var timeout = null;
    var adding = false;
    var stepSpeed = 500;

    function serializeCoords(a,b) {
        return a+'x'+b;
    }

    function serialToArray(str) {
        var arr = str.split('x');
        return [+arr[0],+arr[1]];
    }

    function logic(xyArr,state) {
        var x = xyArr[0];
        var y = xyArr[1];
        if (x > xMax || y > yMax || x < 0 || y < 0) return false;
        var checkArr = [
            [x-1,y-1], [x-1,y], [x-1,y+1],
            [x,  y-1],          [x,  y+1],
            [x+1,y-1], [x+1,y], [x+1,y+1]
        ];
        var neighbors = 0;
        checkArr.forEach(function(_xyArr){
            if (board[serializeCoords(_xyArr[0],_xyArr[1])]) neighbors += 1;
        });
        return state ? (neighbors > 1 && neighbors < 4) : (neighbors === 3);
    }

    function step() {
        var tStart = new Date().getTime();
        var drawCoords = [];
        var supplanter = {};
        var empties = {};
        // calculate new state
        for (var serialCoord in board) {
            // all living cells
            var xyArr = serialToArray(serialCoord);
            if (logic(xyArr,true)) {
                supplanter[serialCoord] = 1;
                drawCoords.push(xyArr);
            }
            // neighboring empty cells
            var x = xyArr[0];
            var y = xyArr[1];
            var checkArr = [
                [x-1,y-1], [x-1,y], [x-1,y+1],
                [x,  y-1],          [x,  y+1],
                [x+1,y-1], [x+1,y], [x+1,y+1]
            ];
            checkArr.forEach(function(_xyArr){
                var nSerialCoord = serializeCoords(_xyArr[0],_xyArr[1]);
                if (!board[nSerialCoord] && !empties[nSerialCoord]) {
                    empties[nSerialCoord] = 1;
                    if (logic(_xyArr,false)) {
                        supplanter[nSerialCoord] = 1;
                        drawCoords.push(_xyArr);
                    }
                }
            });
        }
        // implement state
        board = supplanter;
        // draw state
        context.clearRect(0,0,context.canvas.width,context.canvas.height);
        context.fillStyle = '#000';
        drawCoords.forEach(function(xyArr){
            context.fillRect(xyArr[0]*lifeEdge,xyArr[1]*lifeEdge,lifeEdge,lifeEdge);
        });
        iteration += 1;
        document.getElementById('readout-iteration').innerHTML = iteration;
        if (animation) timeout = setTimeout(step, stepSpeed - new Date().getTime() + tStart);
    }

    function add(event) {
        if (adding) {
            var X = Math.floor(event.clientX/lifeEdge);
            var Y = Math.floor(event.clientY/lifeEdge)
            board[serializeCoords(X,Y)] = 1;
            context.fillRect(X*lifeEdge,Y*lifeEdge,lifeEdge,lifeEdge);
        }
    }

    function drawBoard() {
        var drawCoords = [];
        for (var serialCoord in board) drawCoords.push(serialToArray(serialCoord));
        context.clearRect(0,0,context.canvas.width,context.canvas.height);
        context.fillStyle = '#000';
        drawCoords.forEach(function(xyArr){
            context.fillRect(xyArr[0]*lifeEdge,xyArr[1]*lifeEdge,lifeEdge,lifeEdge);
        });
    }

    function resizeContext() {
        context.canvas.width = xMax = canvas.offsetWidth;
        context.canvas.height = yMax = canvas.offsetHeight;
        xMax = Math.floor(xMax/lifeEdge);
        yMax = Math.floor(yMax/lifeEdge);
        drawBoard();
    }

    return {
        init: function() {
            canvas = document.getElementById('canvas');
            context = canvas.getContext('2d');
            resizeContext();
            window.addEventListener('resize',resizeContext);
            canvas.addEventListener('mousedown',function(event){
                adding = true;
                add(event);
            });
            canvas.addEventListener('mouseup', function(event){adding = false} );
            canvas.addEventListener('mousemove',add);
            document.addEventListener('keydown',step);
        },
        toggle: function(event) {
            animation = !animation;
            event.target.innerHTML = animation ? 'pause' : 'play';
            if (animation) step();
            else clearTimeout(timeout)
        },
        manualStep: function(event) {
            if (!animation) step();
        },
        setSpeed: function(event) {
            stepSpeed = event.target.value;
        },
        reset: function() {
            animation = false;
            board = {};
            iteration = 0;
            drawBoard();
        }
    }

})();

window.onload = Cgol.init;
