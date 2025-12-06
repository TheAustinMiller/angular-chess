import { Component } from '@angular/core';


/**
 * Dec. 2025 - Chess
 * @author Austin Miller
 */
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
  isWhiteTurn: boolean = true;

  constructor() {
    this.initializeBoard();
  }

  /**
   * Handles cell click by selecting a piece or attempting a move.
   * @param row The row of the clicked cell
   * @param col The col of the clicked cell
   * @returns void
   */
  onCellClick(row: number, col: number): void {
    const clickedPiece = this.getPiece(row, col);

    if (!this.selectedPiece) {
      if (clickedPiece && clickedPiece.color === (this.isWhiteTurn ? 'white' : 'black')) {
        this.selectedPiece = clickedPiece;
        this.selectedRow = row;
        this.selectedCol = col;
      }
      return;
    }

    this.tryMove(this.selectedRow!, this.selectedCol!, row, col);

    this.selectedPiece = null;
    this.selectedRow = null;
    this.selectedCol = null;
  }

  /**
   * Attempts to move a piece from one cell to another.
   * @param fromRow The row of the piece to move
   * @param fromCol The col of the piece to move
   * @param toRow The row of target cell
   * @param toCol The col of the target cell
   * @returns void
   */
  tryMove(fromRow: number, fromCol: number, toRow: number, toCol: number): void {
    const piece = this.getPiece(fromRow, fromCol);
    if (!piece) return;

    if (!this.isValidMove(piece, fromRow, fromCol, toRow, toCol)) return;

    this.gameBoard[toRow][toCol] = piece;
    this.gameBoard[fromRow][fromCol] = null;

    this.isWhiteTurn = !this.isWhiteTurn;
  }

  isValidMove(piece: Piece, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    // Out of bounds
    if (toRow < 0 || toRow >= this.rows || toCol < 0 || toCol >= this.cols) return false;

    // Prevent capturing own piece
    const target = this.getPiece(toRow, toCol);
    if (target && target.color === piece.color) return false;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    // Pawn
    if (piece instanceof Pawn) {
      const direction = piece.color === 'white' ? -1 : 1;

      // forward moves
      if (fromCol === toCol) {
        // single step
        if (toRow === fromRow + direction && !target) return this.wontLeaveKingInCheck(piece, fromRow, fromCol, toRow, toCol);
        // double step from start
        const isStart = (piece.color === 'white' && fromRow === 6) || (piece.color === 'black' && fromRow === 1);
        if (isStart && toRow === fromRow + 2 * direction && !target && !this.getPiece(fromRow + direction, toCol)) {
          return this.wontLeaveKingInCheck(piece, fromRow, fromCol, toRow, toCol);
        }
        return false;
      }

      // diagonal capture
      if (colDiff === 1 && toRow === fromRow + direction && target) {
        return this.wontLeaveKingInCheck(piece, fromRow, fromCol, toRow, toCol);
      }
      return false;
    }

    // Knight
    if (piece instanceof Knight) {
      const ok = (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      return ok && this.wontLeaveKingInCheck(piece, fromRow, fromCol, toRow, toCol);
    }

    // Bishop
    if (piece instanceof Bishop) {
      if (rowDiff !== colDiff) return false;
      if (!this.pathClear(fromRow, fromCol, toRow, toCol)) return false;
      return this.wontLeaveKingInCheck(piece, fromRow, fromCol, toRow, toCol);
    }

    // Rook
    if (piece instanceof Rook) {
      if (fromRow !== toRow && fromCol !== toCol) return false;
      if (!this.pathClear(fromRow, fromCol, toRow, toCol)) return false;
      return this.wontLeaveKingInCheck(piece, fromRow, fromCol, toRow, toCol);
    }

    // Queen
    if (piece instanceof Queen) {
      const isStraight = fromRow === toRow || fromCol === toCol;
      const isDiagonal = rowDiff === colDiff;
      if (!isStraight && !isDiagonal) return false;
      if (!this.pathClear(fromRow, fromCol, toRow, toCol)) return false;
      return this.wontLeaveKingInCheck(piece, fromRow, fromCol, toRow, toCol);
    }

    // King
    if (piece instanceof King) {
      if (rowDiff > 1 || colDiff > 1) return false;
      return this.wontLeaveKingInCheck(piece, fromRow, fromCol, toRow, toCol);
    }

    return false;
  }

  private wontLeaveKingInCheck(piece: Piece, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const clone: (Piece | null)[][] = this.gameBoard.map(row => row.slice());

    // Simulate the move
    clone[toRow][toCol] = piece;
    clone[fromRow][fromCol] = null;

    // Find king position for moving side
    const kingColor = piece.color;
    let kingRow = -1, kingCol = -1;

    if (piece instanceof King) {
      kingRow = toRow;
      kingCol = toCol;
    } else {
      outer: for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const p = clone[r][c];
          if (p instanceof King && p.color === kingColor) {
            kingRow = r;
            kingCol = c;
            break outer;
          }
        }
      }
    }

    if (kingRow === -1) {
      return false;
    }

    if (this.squareAttacked(kingRow, kingCol, kingColor, clone)) return false;

    return true;
  }

  private squareAttacked(row: number, col: number, kingColor: 'white' | 'black', board: (Piece | null)[][]): boolean {
    const enemyColor = kingColor === 'white' ? 'black' : 'white';
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const p = board[r][c];
        if (!p || p.color !== enemyColor) continue;
        if (this.pieceCanAttack(p, r, c, row, col, board)) return true;
      }
    }
    return false;
  }

  private pieceCanAttack(piece: Piece, fromRow: number, fromCol: number, toRow: number, toCol: number, board: (Piece | null)[][]): boolean {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    if (piece instanceof Pawn) {
      const direction = piece.color === 'white' ? -1 : 1;
      return colDiff === 1 && toRow === fromRow + direction;
    }

    // Knight
    if (piece instanceof Knight) {
      return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    const pathClearOnBoard = (fr: number, fc: number, tr: number, tc: number): boolean => {
      const stepRow = Math.sign(tr - fr);
      const stepCol = Math.sign(tc - fc);
      let r = fr + stepRow;
      let c = fc + stepCol;
      while (r !== tr || c !== tc) {
        if (board[r][c]) return false;
        r += stepRow;
        c += stepCol;
      }
      return true;
    };

    // Bishop
    if (piece instanceof Bishop) {
      if (rowDiff !== colDiff) return false;
      return pathClearOnBoard(fromRow, fromCol, toRow, toCol);
    }

    // Rook
    if (piece instanceof Rook) {
      if (fromRow !== toRow && fromCol !== toCol) return false;
      return pathClearOnBoard(fromRow, fromCol, toRow, toCol);
    }

    // Queen
    if (piece instanceof Queen) {
      const isStraight = fromRow === toRow || fromCol === toCol;
      const isDiagonal = rowDiff === colDiff;
      if (!isStraight && !isDiagonal) return false;
      return pathClearOnBoard(fromRow, fromCol, toRow, toCol);
    }

    // King
    if (piece instanceof King) {
      return rowDiff <= 1 && colDiff <= 1;
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

  initializeBoard() {
    this.gameBoard = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => null)
    );

    // Standard starting position
    this.gameBoard[0][0] = new Rook('black');
    this.gameBoard[0][1] = new Knight('black');
    this.gameBoard[0][2] = new Bishop('black');
    this.gameBoard[0][3] = new Queen('black');
    this.gameBoard[0][4] = new King('black');
    this.gameBoard[0][5] = new Bishop('black');
    this.gameBoard[0][6] = new Knight('black');
    this.gameBoard[0][7] = new Rook('black');

    for (let i = 0; i < this.cols; i++) {
      this.gameBoard[1][i] = new Pawn('black');
      this.gameBoard[6][i] = new Pawn('white');
    }

    this.gameBoard[7][0] = new Rook('white');
    this.gameBoard[7][1] = new Knight('white');
    this.gameBoard[7][2] = new Bishop('white');
    this.gameBoard[7][3] = new Queen('white');
    this.gameBoard[7][4] = new King('white');
    this.gameBoard[7][5] = new Bishop('white');
    this.gameBoard[7][6] = new Knight('white');
    this.gameBoard[7][7] = new Rook('white');
  }

  getPiece(row: number, col: number): Piece | null {
    return this.gameBoard[row][col];
  }
}

export class Piece {
  color: 'white' | 'black';
  symbol: string;
  constructor(color: 'white' | 'black', symbol: string) {
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
