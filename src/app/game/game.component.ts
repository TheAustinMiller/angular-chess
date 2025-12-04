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
    let flag = true;
    // Basic boundary check
    if (toRow < 0 || toRow >= this.rows || toCol < 0 || toCol >= this.cols) {
      return false;
    }
    if (this.selectedPiece !== null && this.selectedPiece.color === this.getPiece(toRow, toCol)?.color) {
      return false;
    }

    // PAWN
    if (this.selectedPiece instanceof Pawn) {
      const direction = this.selectedPiece.color === 'white' ? -1 : 1;
      if (fromCol === toCol) {
        // Move forward
        if (toRow === fromRow + direction && !this.getPiece(toRow, toCol)) {
          return true;
        } else if ((fromRow === 1 && this.selectedPiece.color === 'black' || fromRow === 6 && this.selectedPiece.color === 'white') &&
          toRow === fromRow + 2 * direction && !this.getPiece(toRow, toCol) && !this.getPiece(fromRow + direction, toCol)) {
          return true;
        } else {
          return false;
        }
      } else if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction) {
        // Capture
        const targetPiece = this.getPiece(toRow, toCol);
        if (targetPiece && targetPiece.color !== this.selectedPiece.color) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else if (this.selectedPiece instanceof Rook) { // ROOK
      if (fromRow !== toRow && fromCol !== toCol) {
        return false;
      }
      const distance = Math.max(Math.abs(toRow - fromRow), Math.abs(toCol - fromCol));
      for (let i = 1; i < distance; i++) {
        const intermediateRow = fromRow + (toRow - fromRow) * i / distance;
        const intermediateCol = fromCol + (toCol - fromCol) * i / distance;
        if (this.getPiece(intermediateRow, intermediateCol)) {
          return false;
        }
      }
    } else if (this.selectedPiece instanceof Bishop) { // BISHOP
      const rowDiff = Math.abs(toRow - fromRow);
      const colDiff = Math.abs(toCol - fromCol);
      if (rowDiff !== colDiff) {
        return false;
      }
      for (let i = 1; i < rowDiff; i++) {
        const intermediateRow = fromRow + (toRow - fromRow) * i / rowDiff;
        const intermediateCol = fromCol + (toCol - fromCol) * i / colDiff;
        if (this.getPiece(intermediateRow, intermediateCol)) {
          return false;
        }
      }
    } else if (this.selectedPiece instanceof Queen) { // QUEEN
      const rowDiff = Math.abs(toRow - fromRow);
      const colDiff = Math.abs(toCol - fromCol);

      // Must move either like a rook or like a bishop
      const isStraight = fromRow === toRow || fromCol === toCol;
      const isDiagonal = rowDiff === colDiff;

      if (!isStraight && !isDiagonal) return false;

      // Determine step direction
      const stepRow = Math.sign(toRow - fromRow);
      const stepCol = Math.sign(toCol - fromCol);

      let r = fromRow + stepRow;
      let c = fromCol + stepCol;

      // Walk path and check for blocking pieces
      while (r !== toRow || c !== toCol) {
        if (this.getPiece(r, c)) return false;
        r += isStraight ? stepRow : stepRow;
        c += isStraight ? stepCol : stepCol;
      }

      return true;
    }
    else if (this.selectedPiece instanceof King) { // KING
      const rowDiff = Math.abs(toRow - fromRow);
      const colDiff = Math.abs(toCol - fromCol);
      if (rowDiff > 1 || colDiff > 1) {
        return false;
      }
    } else if (this.selectedPiece instanceof Knight) { //KNIGHT
      const rowDiff = Math.abs(toRow - fromRow);
      const colDiff = Math.abs(toCol - fromCol);

      return (rowDiff === 2 && colDiff === 1) ||
        (rowDiff === 1 && colDiff === 2);
    }
    return flag;
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