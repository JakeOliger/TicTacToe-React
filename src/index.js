import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <td className={(props.mostRecent || props.winning) ? "highlight" : ""} onClick={props.onClick}>
            {props.value}
        </td>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                mostRecent={this.props.mostRecent === i}
                winning={this.props.winning.includes(i)}
                onClick={() => this.props.onClick(i)}
                key={i}
            />
        );
    }

    render() {
        var cnt = 0;
        return (
            <table>
                {[0, 1, 2].map((n, i) => {
                    return (
                        <tr key={i}>
                            {[0, 1, 2].map((m, j) => { return this.renderSquare(cnt++); })}
                        </tr>
                    );
                })}
            </table>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                lastMove: {
                    col: null,
                    row: null,
                }
            }],
            xIsNext: true,
            stepNumber: 0,
            showMovesAscending: true,
            isReplaying: false,
        }
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    handleClick(i) {
        if (this.state.isReplaying) return;

        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        var col = i % 3 + 1;
        var row = Math.ceil((i + 1) / 3.0);

        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                lastMove: {
                    col: col,
                    row: row,
                    id: i,
                },
            }]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
        });
    }

    render() {
        const history = this.state.history.slice();
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        let status;
        if (winner) {
            status = 'Winner: ' + winner.label;
        } else if (history.length >= 10 && this.state.stepNumber >= 9) {
            status = "It's a draw!";
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        let replay =
            <button className="replay" onClick={() => {
                if (this.state.isReplaying) return;
                
                this.setState({isReplaying: true});
                var i = 0;
                var intervalId = setInterval(() => {
                    this.jumpTo(i);
                    i++;
                    if (i >= history.length) {
                        this.setState({isReplaying: false});
                        clearInterval(intervalId);
                    }
                }, 500);
            }}>
                {this.state.isReplaying ? "Replaying..." : "Replay"}
            </button>;

        let toggle =
            <button className="sort" onClick={() => this.setState({showMovesAscending: !this.state.showMovesAscending})}>
                Show moves in {this.state.showMovesAscending ? "descending" : "ascending"} order
            </button>;

        const moves = (this.state.showMovesAscending ? history : history.reverse()).map((step, move) => {
            if (!this.state.showMovesAscending) {
                move = history.length - 1 - move;
            }
            const desc = move !== 0 ?
                `Go to move #${move} (${step.lastMove.col}, ${step.lastMove.row})` :
                'Go to game start';
            return (
                <li key={move}>
                    <button className={(move === this.state.stepNumber ? "highlight" : "")} onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        return (
            <div className="game">
                <h2 class="title">Tic-Tac-Toe</h2>
                <div className="game-board">
                <Board
                    winning={winner ? winner.winningIds : []}
                    mostRecent={current.lastMove.id}
                    squares={current.squares}
                    onClick={(i) => this.handleClick(i)}
                />
                </div>
                <div className="game-info">
                    <div className="status">{status}</div>
                    <div>{replay}</div>
                    <div>{toggle}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {label: squares[a], winningIds: lines[i]};
        }
    }
    return null;
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
