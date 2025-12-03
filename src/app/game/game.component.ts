import { Component } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  readonly rows: number = 8;
  readonly cols: number = 8;
  gameBoard: (Piece | null)[][] = [];

  constructor() {
    this.initializeBoard();
  }

  initializeBoard() {
    this.gameBoard = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => null)
    );
    this.gameBoard[0][0] = new Rook("black");
    this.gameBoard[0][1] = new Knight("black");
    this.gameBoard[0][2] = new Bishop("black");
    this.gameBoard[0][3] = new Queen("black");
    this.gameBoard[0][4] = new King("black");
    this.gameBoard[0][5] = new Bishop("black");
    this.gameBoard[0][6] = new Knight("black");
    this.gameBoard[0][7] = new Rook("black");
    for (let i = 0; i < this.rows; i++) {
      this.gameBoard[1][i] = new Pawn("black");
      this.gameBoard[6][i] = new Pawn("white");
    }
    this.gameBoard[7][0] = new Rook("white");
    this.gameBoard[7][1] = new Knight("white");
    this.gameBoard[7][2] = new Bishop("white");
    this.gameBoard[7][3] = new Queen("white");
    this.gameBoard[7][4] = new King("white");
    this.gameBoard[7][5] = new Bishop("white");
    this.gameBoard[7][6] = new Knight("white");
    this.gameBoard[7][7] = new Rook("white");
  }
}

class Piece {
  color: "white" | "black";
  symbol: string;

  constructor(color: "white" | "black", symbol: string) {
    this.color = color;
    this.symbol = symbol;
  }
}

export class Pawn extends Piece {
  constructor(color: 'white' | 'black') {
    super(color, color === 'white' ? 'assets/pawn-w.svg' : 'assets/pawn-b.svg');
  }
}

export class Knight extends Piece {
  constructor(color: 'white' | 'black') {
    super(color, color === 'white' ? 'assets/knight-w.svg' : 'assets/knight-b.svg');
  }
}

export class Bishop extends Piece {
  constructor(color: 'white' | 'black') {
    super(color, color === 'white' ? 'assets/bishop-w.svg' : 'assets/bishop-b.svg');
  }
}

export class Rook extends Piece {
  constructor(color: 'white' | 'black') {
    super(color, color === 'white' ? 'assets/rook-w.svg' : 'assets/rook-b.svg');
  }
}

export class Queen extends Piece {
  constructor(color: 'white' | 'black') {
    super(color, color === 'white' ? 'assets/queen-w.svg' : 'assets/queen-b.svg');
  }
}

export class King extends Piece {
  constructor(color: 'white' | 'black') {
    super(color, color === 'white' ? 'assets/king-w.svg' : 'assets/king-b.svg');
  }
}