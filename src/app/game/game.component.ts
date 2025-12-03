import { Component } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  readonly rows: number = 8;
  readonly cols: number = 8;
  gameBoard: any[][] = [];

  constructor() {
    this.initializeBoard();
  }

  initializeBoard() {
    this.gameBoard = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => null)
    );
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
    super(color, color === 'white' ? '♙' : '♟');
  }
}

export class Knight extends Piece {
  constructor(color: 'white' | 'black') {
    super(color, color === 'white' ? '♘' : '♞');
  }
}

export class Bishop extends Piece {
  constructor(color: 'white' | 'black') {
    super(color, color === 'white' ? '♗' : '♝');
  }
}

export class Rook extends Piece {
  constructor(color: 'white' | 'black') {
    super(color, color === 'white' ? '♖' : '♜');
  }
}

export class Queen extends Piece {
  constructor(color: 'white' | 'black') {
    super(color, color === 'white' ? '♕' : '♛');
  }
}

export class King extends Piece {
  constructor(color: 'white' | 'black') {
    super(color, color === 'white' ? '♔' : '♚');
  }
}