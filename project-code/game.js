import React from 'react';
import ReactDOM from 'react-dom';
import map0 from './maps/map0';
import map1 from './maps/map1';
import map2 from './maps/map2';
import map3 from './maps/map3';
import map4 from './maps/map4';
require('./styles.scss');
//to run script remember to use webpack-dev-server --progress --colors --host $IP --port $PORT
const mapArr = [map0, map1, map2, map3, map4];
var width = 150;
// width: 150
//height: 82
var height = mapArr[0].length / width; 

const initPlayer = {
  type: 'player',
  health: 100,
  level: 0,
  nextLevel: 60,
  dungeon: 0,
  weapon: {
    name: 'screwdriver',
    damage: 7,
    index: 0
  }
};
var boss = {
  type: 'boss',
  health: 200,
  damage: () => {
    return randomNum(50, 50);
  },
};
var medicine = {
  type: 'health',
  health: 20
};
var portal = {
  type: 'portal'
};
var weaponArr = [
  {
  type: 'weapon',
  name: 'sharpened stick',
  damage: 7,
  index: 0
}, {
  type: 'weapon',
  name: 'pitchfork',
  damage: 12,
  index: 1
}, {
  type: 'weapon',
  name: 'sabre',
  damage: 16,
  index: 2
}, {
  type: 'weapon',
  name: 'pistol',
  damage: 22,
  index: 3
}, {
  type: 'weapon',
  name: 'rifle',
  damage: 30
}];
function Enemy(health, damage) {
  this.type = 'enemy';
  this.health = health;
  this.damage = damage;
}
function randomNum(start, range) {
  return Math.floor((Math.random() * range) + start);
}

class GameBoard extends React.Component {
  state = {
    player: initPlayer,
    _map: mapArr[1].slice(0)
  };
  randomIndex = () => {
    return Math.floor(Math.random() * width * height);
  };
  initPosition = (arr) => {
    const index = this.randomIndex();
    if (arr[index] === 1) {
      return index;
    } else {
      return this.initPosition(arr);
    }
  };
  initMap = () => {
    let map = mapArr[0].slice(0);

    map[this.initPosition(map)] = $.extend({}, true, initPlayer);
    map[this.initPosition(map)] = weaponArr[0];
    map[this.initPosition(map)] = portal;
    for (var i = 0; i < 5; i++) {
      map[this.initPosition(map)] = new Enemy(30, () => {
        return randomNum(5, 11)
      });
    }
    for (var i = 0; i < 5; i++) {
      map[this.initPosition(map)] = medicine;
    }
    this.setState({
      player: $.extend({}, true, initPlayer),
      _map: map
    });
  };
  playerPosition = () => {
    return this.state._map.findIndex(function(square) {
      return typeof square === 'object' ? square.type === 'player' : false;
    });
  };
  changeDungeon = (playerObj) => {
    let currentMap = this.state._map;
    let mapIndex;
    let enemy;
    if (currentMap[0] === mapArr[0][0]) {
      currentMap = mapArr[1].slice(0);
      mapIndex = 1;
      enemy = new Enemy(40, () => {
        return randomNum(16, 14);
      });

    } else if (currentMap[0] === mapArr[1][0]) {
      currentMap = mapArr[2].slice(0);
      mapIndex = 2;
      enemy = new Enemy(65, () => {
        return randomNum(15, 30);
      });

    } else if (currentMap[0] === mapArr[2][0]) {
      currentMap = mapArr[3].slice(0);
      mapIndex = 3;
      enemy = new Enemy(90, () => {
        return randomNum(30, 38);
      });

    } else if (currentMap[0] === mapArr[3][0]) {
      currentMap = mapArr[4].slice(0);
      mapIndex = 4;
      enemy = new Enemy(135, () => {
        return randomNum(35, 40);
      });
    }
    playerObj.dungeon = mapIndex;
    currentMap[this.initPosition(currentMap)] = playerObj;
    currentMap[this.initPosition(currentMap)] = weaponArr[mapIndex];
    currentMap[this.initPosition(currentMap)] = mapIndex < 4 ? portal : $.extend(true, {}, boss);
    for (var i = 0; i < 5; i++) {
      currentMap[this.initPosition(currentMap)] = $.extend(true, {}, enemy);
    }
    for (var i = 0; i < 5; i++) {
      currentMap[this.initPosition(currentMap)] = medicine;
    }
    this.setState({
      player: playerObj,
      _map: currentMap
    });
  };
  interact = (playerPos, nextPos) => {
    let currentMap = this.state._map;

    function move() {
      currentMap[nextPos] = currentMap[playerPos];
      currentMap[playerPos] = 1;
    }
    if (currentMap[nextPos].type === 'enemy') {
      let enemyDamage = currentMap[nextPos].damage();
      currentMap[nextPos].health -= currentMap[playerPos].weapon.damage;

      if (currentMap[nextPos].health <= 0) {
        currentMap[playerPos].nextLevel -= 10 * (currentMap[playerPos].level + 1);
        if (currentMap[playerPos].nextLevel === 0) {
          //increase level
          currentMap[playerPos].level += 1;
          currentMap[playerPos].health += 20 * currentMap[playerPos].level;
          currentMap[playerPos].weapon.damage += 12 * currentMap[playerPos].level;
          currentMap[playerPos].nextLevel = 60 * (currentMap[playerPos].level + 1);
        }
        //remove enemy
        currentMap[nextPos] = 1;
        this.setState({
          player: currentMap[playerPos],
          _map: currentMap
        });
      } else {
        currentMap[playerPos].health -= enemyDamage;
        this.setState({
          player: currentMap[playerPos],
          _map: currentMap
        });
      }
      if (currentMap[playerPos].health <= 0) {
        alert('you died. better luck next time');
        this.initMap();
      }
    } else if (currentMap[nextPos].type === 'boss') {
      let bossDamage = currentMap[nextPos].damage();
      currentMap[nextPos].health -= currentMap[playerPos].weapon.damage;

      if (currentMap[nextPos].health <= 0) {
        alert('a winner is you!');
        this.initMap();
      } else {
        currentMap[playerPos].health -= bossDamage;
        if (currentMap[playerPos].health <= 0) {
          alert('you died. better luck next time');
          this.initMap();
        } else {
          this.setState({
            player: currentMap[playerPos],
            _map: currentMap
          });
        }
      }

    } else if (currentMap[nextPos].type === 'health') {
      currentMap[playerPos].health += currentMap[nextPos].health;
      move();
      this.setState({
        player: currentMap[nextPos],
        _map: currentMap
      });
    } else if (currentMap[nextPos].type === 'weapon') {
      currentMap[playerPos].weapon.name = currentMap[nextPos].name;
      currentMap[playerPos].weapon.damage += currentMap[nextPos].damage;
      move();
      this.setState({
        player: currentMap[nextPos],
        _map: currentMap
      });
    } else if (currentMap[nextPos].type === 'portal') {
      this.changeDungeon(currentMap[playerPos]);
    }

  };
  changePosition = (playerPos, nextPos) => {
    let currentMap = this.state._map;
    if (currentMap[nextPos] === 1) {
      currentMap[nextPos] = currentMap[playerPos];
      currentMap[playerPos] = 1;
      this.setState({
        player: this.state.player,
        _map: currentMap
      })
    } else if (typeof currentMap[nextPos] === 'object') {
      this.interact(playerPos, nextPos);
    }

  };
  playerView = () => {
    const index = this.playerPosition();
    let squares = [];

    function left(i) {
      return index - i;
    }
    function top(i) {
      return index - width * i;
    }
    function right(i) {
      return index + i;
    }
    function bottom(i) {
      return index + width * i;
    }

    for (var i = 1; i <= 5; i++) {
      //place player withen view
      squares.push(index);
      //show view around player
      squares.push(left(i));
      squares.push(top(i));
      squares.push(right(i));
      squares.push(bottom(i));

      for (var j = 1; j <= 5; j++) {
        squares.push(left(i) + width * j);
        squares.push(left(i) - width * j);
        squares.push(right(i) + width * j);
        squares.push(right(i) - width * j);
      }
    }

    //left
  
    squares.push(left(6) - width * 4);
    squares.push(left(6) - width * 3);
    squares.push(left(6) - width * 2);
    squares.push(left(6) - width * 1);
    squares.push(left(6));
    squares.push(left(6) + width * 1);
    squares.push(left(6) + width * 2);
    squares.push(left(6) + width * 3);
    squares.push(left(6) + width * 4);
    
    squares.push(left(7) - width * 3);
    squares.push(left(7) - width * 2);
    squares.push(left(7) - width * 1);
    squares.push(left(7));
    squares.push(left(7) + width * 1);
    squares.push(left(7) + width * 2);
    squares.push(left(7) + width * 3);
    
    squares.push(left(8) + width * 1);
    squares.push(left(8) + width * 2);
    squares.push(left(8));
    squares.push(left(8) - width * 1);
    squares.push(left(8) - width * 2);
  
    //top
    
    squares.push(top(6) - 4);
    squares.push(top(6) - 3);
    squares.push(top(6) - 2);
    squares.push(top(6) - 1);
    squares.push(top(6) + 1);
    squares.push(top(6) + 2);
    squares.push(top(6));
    squares.push(top(6) + 3);
    squares.push(top(6) + 4);
    
    squares.push(top(7) - 3);
    squares.push(top(7) - 2);
    squares.push(top(7) - 1);
    squares.push(top(7));
    squares.push(top(7) + 1);
    squares.push(top(7) + 2);
    squares.push(top(7) + 3);
    
    squares.push(top(8) + 1);
    squares.push(top(8) + 2);
    squares.push(top(8));
    squares.push(top(8) - 1);
    squares.push(top(8) - 2);
    
    
    //right
    squares.push(right(6) - width * 4);
    squares.push(right(6) - width * 3);
    squares.push(right(6) - width * 2);
    squares.push(right(6) - width * 1);
    squares.push(right(6) + width * 1);
    squares.push(right(6) + width * 2);
    squares.push(right(6));
    squares.push(right(6) + width * 3);
    squares.push(right(6) + width * 4);
    
    squares.push(right(7) - width * 3);
    squares.push(right(7) - width * 2);
    squares.push(right(7) - width * 1);
    squares.push(right(7));
    squares.push(right(7) + width * 1);
    squares.push(right(7) + width * 2);
    squares.push(right(7) + width * 3);
    
    squares.push(right(8) + width * 1);
    squares.push(right(8) + width * 2);
    squares.push(right(8));
    squares.push(right(8) - width * 1);
    squares.push(right(8) - width * 2);
    
    //bottom
     
    squares.push(bottom(6) - 4);
    squares.push(bottom(6) - 3);
    squares.push(bottom(6) - 2);
    squares.push(bottom(6) - 1);
    squares.push(bottom(6));
    squares.push(bottom(6) + 1);
    squares.push(bottom(6) + 2);
    squares.push(bottom(6) + 3);
    squares.push(bottom(6) + 4);
    
    squares.push(bottom(7) - 3);
    squares.push(bottom(7) - 2);
    squares.push(bottom(7) - 1);
    squares.push(bottom(7));
    squares.push(bottom(7) + 1);
    squares.push(bottom(7) + 2);
    squares.push(bottom(7) + 3);
    
    squares.push(bottom(8) + 1);
    squares.push(bottom(8) + 2);
    squares.push(bottom(8));
    squares.push(bottom(8) - 1);
    squares.push(bottom(8) - 2);
    return squares;
  };
  componentWillMount() {
    this.initMap();
  };
  componentDidMount() {
    document.body.addEventListener('keydown', (e) => {
      var leftSquare = this.playerPosition() - 1;
      var upSquare = this.playerPosition() - width;
      var rightSquare = this.playerPosition() + 1;
      var downSquare = this.playerPosition() + width;
      switch (e.which) {
        case 37: // left
          this.changePosition(this.playerPosition(), leftSquare);
          break;

        case 38: // up
          this.changePosition(this.playerPosition(), upSquare);
          break;

        case 39: // right
          this.changePosition(this.playerPosition(), rightSquare);
          break;

        case 40: // down
          this.changePosition(this.playerPosition(), downSquare);
          break;

        default:
          return; // exit this handler for other keys
      }
      e.preventDefault(); // prevent the default action (scroll / move caret)
    });
  };
  render() {

    const player = this.state._map[this.playerPosition()];
    const view = this.playerView();
    
    return (
      <div>
        <div id='stats'>
          <span>Health: {player.health} </span>
          <span>Weapon: {player.weapon.name} </span>
          <span>Attack: {player.weapon.damage} </span>
          <span>Dungeon: {player.dungeon} </span>
          <span>Level: {player.level} </span>
          <span>Next Level: {player.nextLevel} XP</span>
          <h2></h2>
        </div>
        <div id='board'>
        
        {this.state._map.map((item, i) => {
          if(view.indexOf(i) !== -1) {
            if (typeof item === 'number') {
              return <div className={item === 0 ? 'wall' : 'road'}></div>;
            } 
            else {
              if (item.type === 'player' || item.type === 'boss') {
                return <div id={item.type}></div>;
              }
              else {
                return <div className={item.type}></div>;
              }
            }
          }
       
          else {
            return <div className='hidden'></div>;
          }
          
            
    })}
      </div>
    </div>)
  }
}
ReactDOM.render(<GameBoard />, document.getElementById('game-board'));