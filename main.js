const canvas = document.createElement('canvas');
canvas.width = 900;
canvas.height = 900;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const view = {
    /**
     * 单元格长度
     */
    GRID_LENGTH: 30,
    /**
     * 单元格颜色
     */
    FILL_COLOR: "#ccc",
    /**
     * 空格颜色
     */
    BLANK_COLOR: "#eee",
    /**
     * 数字色板
     */
    COLOR_BOARD: ['blue', 'green', 'red', '#795548', '#607d8b', '#673ab7', '#3f51b5', 'black'],
    init() {
        this.render();
    },
    clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    render() {
        this.clear();
        this.renderBoard();
        this.renderBlock();
        if (game.isOver) {
            this.renderGameOver()
        }
    },
    renderBoard() {
        const length = model.WIDTH * this.GRID_LENGTH;
        ctx.fillStyle = this.FILL_COLOR;
        ctx.fillRect(0, 0, length, length); // x, y, width, height
        for (var i = 0; i < model.WIDTH + 1; i++) {
            ctx.moveTo(this.GRID_LENGTH * i, 0); // x, y
            ctx.lineTo(this.GRID_LENGTH * i, length);
            ctx.stroke();

            ctx.moveTo(0, this.GRID_LENGTH * i); // x, y
            ctx.lineTo(length, this.GRID_LENGTH * i);
            ctx.stroke();
        }
    },
    renderBlock() {
        for (let i = 0; i < model.WIDTH; i++) {
            for (let j = 0; j < model.WIDTH; j++) {
                const text = model.board[i][j];
                if (text == 'E' || text == 'M') continue;
                if (text == 'EF' || text == 'MF') {
                    ctx.fillStyle = 'red';
                    ctx.font = "20px Verdana";
                    const x = i * this.GRID_LENGTH + this.GRID_LENGTH / 2 - 6;
                    const y = j * this.GRID_LENGTH + this.GRID_LENGTH / 2 + 6;
                    ctx.fillText('F', x, y)
                    continue;
                }
                const x = i * this.GRID_LENGTH + 1;
                const y = j * this.GRID_LENGTH + 1;
                ctx.fillStyle = this.BLANK_COLOR;
                ctx.fillRect(x, y, this.GRID_LENGTH - 2, this.GRID_LENGTH - 2);
                if (text !== 'B') {
                    const x = i * this.GRID_LENGTH + this.GRID_LENGTH / 2 - 6;
                    const y = j * this.GRID_LENGTH + this.GRID_LENGTH / 2 + 6;
                    if (text === 'X') {
                        ctx.fillStyle = 'red';
                    } else {
                        ctx.fillStyle = this.COLOR_BOARD[Number(text) - 1];
                    }
                    ctx.font = "20px Verdana";
                    ctx.fillText(text, x, y)
                }
            }
        }
    },
    renderGameOver() {
        ctx.font = "60px 微软雅黑";
        ctx.fillStyle = "red";
        ctx.fillText("Game Over", 260, 400);
    }
}

const game = {
    ALLOW_ERROR_RANGE: 8,
    isOver: false,
    init() {
        model.init();
        view.init();
        document.querySelector('canvas').onclick = function (e) {
            if (game.isOver) return;
            var x = e.offsetX;
            var y = e.offsetY;
            if (game.check(x, y)) {
                model.sweeper();
                view.render();
            }
        }
        document.querySelector('canvas').oncontextmenu = function (e) {
            if (game.isOver) return;
            var x = e.offsetX;
            var y = e.offsetY;
            if (game.check(x, y)) {
                model.mark();
                view.render();
            }
            return false
        }
    },
    check(x, y) {
        const xError = x % view.GRID_LENGTH;
        const yError = y % view.GRID_LENGTH;
        if (xError < this.ALLOW_ERROR_RANGE || xError > view.GRID_LENGTH - this.ALLOW_ERROR_RANGE) {
            return false;
        }
        if ((yError < this.ALLOW_ERROR_RANGE || yError > view.GRID_LENGTH - this.ALLOW_ERROR_RANGE)) {
            return false;
        }
        if (xError < this.ALLOW_ERROR_RANGE) {
            x = Math.round((x - xError) / view.GRID_LENGTH) - 1;
        } else {
            x = Math.round((x - xError) / view.GRID_LENGTH);
        }
        if (yError < this.ALLOW_ERROR_RANGE) {
            y = Math.round((y - yError) / view.GRID_LENGTH) - 1;
        } else {
            y = Math.round((y - yError) / view.GRID_LENGTH);
        }
        model.x = x;
        model.y = y
        return true;
    },
    over() {
        this.isOver = true;
        view.renderGameOver();
    }
}

const model = {
    /**
     * 单元格数目
     */
    WIDTH: 21,
    x: undefined,
    y: undefined,
    board: [],
    searchList: [[-1, -1], [-1, 0], [-1, 1], [1, 0], [1, -1], [0, -1], [0, 1], [1, 1]],
    init() {
        this.board = Array.from(new Array(this.WIDTH)).map(item => item = new Array(this.WIDTH)); // 网格

        for (let i = 0; i < this.WIDTH; i++) {
            for (let j = 0; j < this.WIDTH; j++) {
                this.board[i][j] = Math.random() > 0.9 ? "M" : "E";
            };
        }
    },
    sweeper() {
        const x = this.x;
        const y = this.y;
        if (this.board[x][y] == 'M') {
            this.board[x][y] = 'X'
            game.over();
            return this.board
        }
        if (this.board[x][y] === 'EF' || this.board[x][y] === 'MF') {
            this.board[x][y] = this.board[x][y][0];
            return this.board
        }
        if (this.board[x][y] != 'E') {
            return this.board
        }

        sweeper = (x, y) => {
            count = 0
            for (const v of this.searchList) {
                if (0 <= (x + v[0]) && (x + v[0]) < this.WIDTH && 0 <= (y + v[1]) && (y + v[1]) < this.WIDTH) {
                    if (['M', 'MF'].includes(this.board[x + v[0]][y + v[1]])) {
                        count += 1
                    }
                }
            }
            if (count > 0) {
                this.board[x][y] = count
                return
            } else {
                this.board[x][y] = 'B'
            }
            //  如果point为B (blank)
            for (const v of this.searchList) {
                const [_x, _y] = [x + v[0], y + v[1]]
                if (0 <= _x && _x < this.WIDTH && 0 <= _y && _y < this.WIDTH && this.board[_x][_y] != 'B') {
                    sweeper(_x, _y)
                }
            }
        }
        sweeper(x, y);
        return this.board
    },
    mark() {
        const x = this.x;
        const y = this.y;
        if (this.board[x][y] == 'B') return this.board
        if (this.board[x][y] == 'E' || this.board[x][y] == 'M') {
            this.board[x][y] = this.board[x][y] + 'F'
            return this.board
        }
        if (this.board[x][y] == 'EF' || this.board[x][y] == 'MF') {
            this.board[x][y] = this.board[x][y][0]
            return this.board
        }
        // TODO：auto sweeper
    }

}

game.init();