
Connect4 = _.Class(function(columns, rows, four) {
  this.columns = [];
  this.rows = rows;
  this.four = four || 4;
  for(var i = 0; i < columns; i++) {
    this.columns.push([]);
  }
}, { 
  proto: {
    can_move: function(column) {
      return this.columns[column].length < this.rows;
    },
    move: function(player, column) {
      if(!this.can_move(column)) throw new Error("Can't move there");
      this.columns[column].push(player);
    },
    winner: function() {
      var current;
      var count = 0;
      for(var row = 0; row < this.rows; row++) {
        count = 0;
        for(var col = 0; col < this.columns.length; col++) {
          if(this.columns[col][row] != current) {
            count = 0;
          }
          current = this.columns[col][row]
          count++;
          if(current && count == this.four) return current;
        }
      }

      for(var col = 0; col < this.columns.length; col++) {
        count = 0;
        for(var row = 0; row < this.rows; row++) {
          if(this.columns[col][row] != current) {
            count = 0;
          }
          current = this.columns[col][row]
          count++;
          if(current && count == this.four) return current;
        }
      }

      for(var s_col = 0; s_col <= this.columns.length - this.four; s_col++)
      for(var s_row = 0; s_row <= this.rows - this.four; s_row++) {
        var check = this.columns[s_col][s_row], count = 0;
        if(!check) continue;
        for(var row = s_row, col = s_col; 
            row < this.rows && col < this.columns.length && count < this.four;
            row++, col++, count++)
        {
          if(check != this.columns[col][row]) break;
        }
        if(count == this.four) return check;
      }
     
      for(var s_col = 0; s_col <= this.columns.length - this.four; s_col++)
      for(var s_row = this.four-1; s_row < this.rows; s_row++) {
        var check = this.columns[s_col][s_row], count = 0;
        if(!check) continue;
        for(var row = s_row, col = s_col; 
            row >= 0 && col < this.columns.length && count < this.four;
            row--, col++, count++)
        {
          if(check != this.columns[col][row]) break;
        }
        if(count == this.four) return check;
      }

      return false;
    }
  }
});

// vim: set sw=2 ts=2 expandtab :
