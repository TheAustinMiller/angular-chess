import { Component } from '@angular/core';
import { from } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  readonly rows: number = 8;
  readonly cols: number = 8;
  gameBoard: (Piece | null)[][] = [];
  selectedPiece: Piece | null = null;
  selectedRow: number | null = null;
  selectedCol: number | null = null;

  constructor() {
    this.initializeBoard();
  }

  onCellClick(row: number, col: number): void {
    const clickedPiece = this.getPiece(row, col);

    // Select piece
    if (!this.selectedPiece) {
      if (clickedPiece) {
        this.selectedPiece = clickedPiece;
        this.selectedRow = row;
        this.selectedCol = col;
      }
      return;
    }

    // Try move
    this.tryMove(this.selectedRow!, this.selectedCol!, row, col);

    // Clear selection after move attempt
    this.selectedPiece = null;
    this.selectedRow = null;
    this.selectedCol = null;
  }

  tryMove(fromRow: number, fromCol: number, toRow: number, toCol: number): void {
    const piece = this.getPiece(fromRow, fromCol);

    if (!piece) return;

    // TODO: rule checks go here
    if (!this.isValidMove(piece, fromRow, fromCol, toRow, toCol)) return;

    // Move the piece
    this.gameBoard[toRow][toCol] = piece;
    this.gameBoard[fromRow][fromCol] = null;
  }

  isValidMove(piece: Piece, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    // Out of bounds
    if (toRow < 0 || toRow >= this.rows || toCol < 0 || toCol >= this.cols)
      return false;

    // Cannot capture same color
    const target = this.getPiece(toRow, toCol);
    if (target && target.color === piece.color)
      return false;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    // ------------------------------------
    // PAWN
    // ------------------------------------
    if (piece instanceof Pawn) {
      const direction = piece.color === "white" ? -1 : 1;

      // forward move
      if (fromCol === toCol) {
        // single step
        if (toRow === fromRow + direction && !target)
          return true;

        // double step
        const isStart = (piece.color === "white" && fromRow === 6) ||
          (piece.color === "black" && fromRow === 1);

        if (isStart &&
          toRow === fromRow + 2 * direction &&
          !target &&
          !this.getPiece(fromRow + direction, toCol)) {
          return true;
        }

        return false;
      }

      // diagonal capture
      if (colDiff === 1 && toRow === fromRow + direction && target)
        return target.color !== piece.color;

      return false;
    }

    // ------------------------------------
    // ROOK
    // ------------------------------------
    if (piece instanceof Rook) {
      if (fromRow !== toRow && fromCol !== toCol) return false;
      return this.pathClear(fromRow, fromCol, toRow, toCol);
    }

    // ------------------------------------
    // BISHOP
    // ------------------------------------
    if (piece instanceof Bishop) {
      if (rowDiff !== colDiff) return false;
      return this.pathClear(fromRow, fromCol, toRow, toCol);
    }

    // ------------------------------------
    // QUEEN
    // ------------------------------------
    if (piece instanceof Queen) {
      const isStraight = fromRow === toRow || fromCol === toCol;
      const isDiagonal = rowDiff === colDiff;

      if (!isStraight && !isDiagonal) return false;

      return this.pathClear(fromRow, fromCol, toRow, toCol);
    }

    // ------------------------------------
    // KING
    // ------------------------------------
    if (piece instanceof King) {
      return rowDiff <= 1 && colDiff <= 1;
    }

    // ------------------------------------
    // KNIGHT
    // ------------------------------------
    if (piece instanceof Knight) {
      return (rowDiff === 2 && colDiff === 1) ||
        (rowDiff === 1 && colDiff === 2);
    }

    return false;
  }

  private pathClear(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const stepRow = Math.sign(toRow - fromRow);
    const stepCol = Math.sign(toCol - fromCol);

    let r = fromRow + stepRow;
    let c = fromCol + stepCol;

    while (r !== toRow || c !== toCol) {
      if (this.getPiece(r, c)) return false;
      r += stepRow;
      c += stepCol;
    }

    return true;
  }


  getPiece(row: number, col: number): Piece | null {
    return this.gameBoard[row][col];
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