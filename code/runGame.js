/*****************************构造地图*****************************************
 * 构造了Level对象表示地图                       
 *  Level的属性                                   
 *    width:表示地图的每行存储元素的数量           
 *    height:表示地图没列存储元素的数量           
 *    grid:存储非活动元素                         
 *    actors:存储活动元素(如玩家，硬币，岩浆)      
 *    player:表示地图中的玩家                     
 *    status:记录玩家的胜负状态                    
 *    finishDelay:记录游戏结束进入下一关的延迟时    
 *    unmatched:记录玩家是否处于无敌模式
 *    unmatchedTime:记录玩家无敌模式持续的时间
 *    hp:记录玩家的血量（初始化为3）
 *    timeCount:记录玩家玩游戏的时间
 *    coinCount:记录金币数
 *    bulletDelay:用于记录每次发射子弹最少的间隔时间
 *    hasBullet:用于记录是否已经有子弹了
 * Level的方法
 *    isFinished:用于判断是否已经结束游戏
 *    showResult:在控制台显示金币数，耗费的时间以及血槽剩余值
 *    getGameTime:获取游戏的时间
 *    getHP:获取当前的血量
 *    getUnmatchedTime:设置无敌状态剩余的时间
 *    obstacleAt:返回指定位置的元素类型
 *    actorAt:找到与actor有碰撞的物体并返回
 *    animate:让关卡中的每个元素都有一次移动的机会(step表示时间间隔)
 *    playerTouched:玩家的碰撞处理
 *    controlStatus:用于实时处理status的状态,并计时
 *    controlUnmatched：用于实时处理无敌状态
 *    controlBullet:用于实时处理地图中的子弹
 *    bulletTouched:子弹的碰撞处理
 * 
 ***************************************************************************/
/******************************构造地图中的元素*******************************
 * 设置坐标对象Vector
 *    Vector的属性
 *      x:用于表示横坐标
 *      y:用于表示纵坐标
 *    Vector的方法
 *      plus:用于加减指定元素的坐标
 *      times:通过factor来缩放向量，在移动元素时可以计算速度向量与时间间隔的乘机
 * **************************************************************************
 * 设置玩家对象Player
 *    Player的属性
 *      pos:表示玩家的当前位置
 *      size:表示玩家的长和高
 *      speed:存储当前的移动速度以及方向，用于模拟动量或重力
 *      type:设置当前元素的类型
 *      lastDir:记录上一次移动的方向是right还是left（默认为right）
 *    Player的方法
 *      moveX:设置玩家的水平移动(通过keys来判断是否执行)
 *      moveY:设置玩家的跳跃动作(通过keys来判断是否执行)
 *      shoot:设置玩家的射击操作
 *      act:描述元素的行为操作
 *      
 *      
 * **************************************************************************
 * 设置岩浆对象Lava
 *    Lava的属性
 *      pos:表示元素的当前位置
 *      size:表示元素的长和高
 *      speed:存储当前的移动速度以及方向，用于模拟动量或重力
 *      repeatPos:记录岩浆初始的位置(用于下落的岩浆)
 *    Lava的方法
 *      type:设置当前元素的类型
 *      act:设置岩浆的移动方法
 * ***************************************************************************
 * 设置硬币对象Coin
 *    Coin的属性
 *      pos:表示元素的当前位置
 *      basePos:用于记录基准位置
 *      size:表示元素的长和高
 *      wobble:记录硬币摆动的幅度
 *      type:设置当前元素的类型
 *    Coin的方法
 *      act:设置硬币的晃动
 * *****************************************************************************
 * 设置子弹对象Bullet
 *    Bullet的属性
 *      pos:表示元素的当前位置
 *      size:表示元素的长和高
 *      speed:存储当前的移动速度以及方向，用于模拟动量或重力
 *      type:设置当前元素的类型
 *    Bullet的方法
 *      act:描述子弹的移动
 * 
 * 
 */





//========================读取关卡========================================

var simpleLevelPlan = [
  "                      ",
  "                      ",
  "  x              = x  ",
  "  x         o o    x  ",
  "  x @      xxxxx   x  ",
  "  xxxxx            x  ",
  "      x!!!!!!!!!!!!x  ",
  "      xxxxxxxxxxxxxx  ",
  "                      ",
];

/**
 * 构造Level对象
 * @param {地图} plan
 */


function Level(plan) {

  this.width = plan[0].length;
  this.height = plan.length;
  this.grid = [];
  this.actors = [];

  for (var y = 0; y < this.height; y++) {
    var line = plan[y],
      gridLine = [];
    for (var x = 0; x < this.width; x++) {
      var ch = line[x],
        fieldType = null; //ch:表示地图中的各个元素对应的字符，fieldType表示方块的类型
      var Actor = actorChars[ch]; //将字符映射为指定的活动元素对象
      if (Actor)
        this.actors.push(new Actor(new Vector(x, y), ch));
      else if (ch == "x") fieldType = "wall";
      else if (ch == "!") fieldType = "lava";
      else if (ch == "r") fieldType = "river";
      else if (ch == "d") fieldType = "door";
      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }
  this.player = this.actors.filter(function (actor) {
    return actor.type == "player";
  })[0];

  this.status = this.finishDelay = null;
  this.unmatched = false;
  this.unmatchedTime = 0;
  this.hp = 3;
  this.timeCount = 0;
  this.coinCount = 0;
  this.bulletDelay = 1;
  this.hasBullet = false;
}

Level.prototype.isFinished = function () {
  if (this.status != null && this.finishDelay < 0) {
    return true;
  }
  return false;;
};
//==========================================================================












//========================设置活动元素=======================================

/**
 * 构造坐标对象
 * @param {横坐标} x
 * @param {纵坐标} y
 */
function Vector(x, y) {
  this.x = x;
  this.y = y;
}
Vector.prototype.plus = function (other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function (factor) {
  return new Vector(this.x * factor, this.y * factor);
};

var actorChars = {
  "@": Player,
  "o": Coin,
  "=": Lava,
  "|": Lava,
  "v": Lava,
  "b": Bullet,
  "#": Dest
};

/**
 * 构造玩家对象
 * @param {指定玩家的位置，玩家出现为'@'c出现的高度的二分之一} pos
 */

function Player(pos) {
  this.pos = pos.plus(new Vector(0, 0));
  this.size = new Vector(0.8, 1);
  this.speed = new Vector(0, 0);
  this.lastDir = "right";
}
Player.prototype.type = "player";

/**
 * 构造岩浆对象
 * @param {指定岩浆出现的位置} pos 
 * @param {指定岩浆的类型，若ch为'='则为水平移动的岩浆，若为'|'则为垂直移动的岩浆，若为'v'则是会下落的岩浆熔岩块} ch 
 */
function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch == "=") {
    this.speed = new Vector(2, 0);
  } else if (ch == "|") {
    this.speed = new Vector(0, 2);
  } else if (ch == "v") {
    this.speed = new Vector(0, 3);
    this.repeatPos = pos;
  }
}
Lava.prototype.type = "lava";

/**
 * 构造硬币对象
 * @param {硬币的坐标} pos 
 */
function Coin(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2;
}
Coin.prototype.type = "coin";

function Dest(pos) {
  this.pos = pos;
  this.size = new Vector(1, 1);
}

Dest.prototype.type = "destination";
/**
 * 构造子弹对象
 * @param {子弹的地址} pos 
 * @param {子弹的方向} dir 
 */
function Bullet(pos, dir) {
  this.pos = pos;
  this.size = new Vector(0.6, 0.6);
  this.speed = new Vector(10 * dir, 0);
}
Bullet.prototype.type = "bullet";
//测试地图创建正常
// var simpleLevel = new Level(simpleLevelPlan);
// console.log(simpleLevel.height, simpleLevel.width);
// console.log(simpleLevel);

//==========================================================================














//======================设置动作与冲突=======================================

Level.prototype.showResult = function () {
  console.log("所获得的金币数为" + this.coinCount);
  console.log("所耗费的时间为" + this.getGameTime());
  console.log("血槽为" + this.getHP());
}
Level.prototype.getGameTime = function () {
  var time = this.timeCount;
  time = Math.floor(time);
  var timeStr = "", minute = 0, second = 0;
  if (time >= 60) {
    minute = Math.floor(time / 60);
    time %= 60;
    timeStr += minute + "分";
  }
  if (time > 0) {
    second = time % 60;
    timeStr += second + "秒";
  }
  return timeStr;
}
Level.prototype.getHP = function () {
  return this.hp;
}
Level.prototype.getUnmatchedTime = function () {
  var time = this.unmatchedTime;
  if (time == 0) {
    return null;
  } else {
    return (this.unmatchedTime).toFixed(2);
  }
}

Level.prototype.obstacleAt = function (pos, size) {
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  if (xStart < 0 || xEnd > this.width || yStart < 0) return "wall";//若是到了左右边界则当作墙处理
  if (yEnd > this.height) return "river";//若是到了底部则当作岩浆处理
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var fieldType = this.grid[y][x];
      if (fieldType) return fieldType;
    }
  }
};
Level.prototype.actorAt = function (actor) {
  for (var i = 0; i < this.actors.length; i++) {
    var other = this.actors[i];
    if (
      other != actor &&
      actor.pos.x + actor.size.x > other.pos.x &&
      actor.pos.x < other.pos.x + other.size.x &&
      actor.pos.y + actor.size.y > other.pos.y &&
      actor.pos.y < other.pos.y + other.size.y
    )
      return other;
  }
};
//==========================================================================













//===========================设置活动元素与动作===============================
var maxStep = 0.05;//每次的移动不能超过0.05s
/**
 * 每次隔一小段时间执行的方法
 * @param {时间间隔} step 
 * @param {按键} keys 
 */
Level.prototype.controlStatus = function (step) {
  //status状态的实时处理
  if (this.status != null) {
    this.finishDelay -= step;//调整关卡结束之后，继续进入下一关或者重新开始的时间
    // console.log("结束延迟：" + this.finishDelay)//测试
  } else {
    this.timeCount += step;
  }
}
Level.prototype.controlUnmatched = function (step) {
  //无敌模式的实时处理
  if (this.unmatchedTime < 0) {
    this.unmatched = false;
    this.unmatchedTime = 0;
  }

  if (this.unmatched == true) {
    this.unmatchedTime -= step;
    var countUnmatchedTime = this.getUnmatchedTime();
  }
}
Level.prototype.controlBullet = function (step) {
  //子弹的实时处理
  if (this.bulletDelay < 0) {
    this.hasBullet = false;
    this.bulletDelay = 1;
  }
  if (this.hasBullet) {
    this.bulletDelay -= step;
  }
}
Level.prototype.animate = function (step, keys) {
  this.controlStatus(step);
  this.controlUnmatched(step);
  this.controlBullet(step);
  while (step > 0) {//为了使得动画连贯，将移动的距离进行分割，每次都要小于0.05
    var thisStep = Math.min(step, maxStep);
    this.actors.forEach(function (actor) {
      actor.act(thisStep, this, keys);
    }, this);
    step -= thisStep;
  }
};

Lava.prototype.act = function (step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if (!level.obstacleAt(newPos, this.size)) this.pos = newPos;
  else if (this.repeatPos) this.pos = this.repeatPos;//若是垂直下落的熔岩，则触碰到障碍物就回到初始的位置
  else this.speed = this.speed.times(-1);//其他的熔岩则向相反的方向移动
};
var wobbleSpeed = 8,
  wobbleDist = 0.07;

Coin.prototype.act = function (step) {
  this.wobble += step * wobbleSpeed;//跟踪时间以创建波长
  var wobblePos = Math.sin(this.wobble) * wobbleDist;//以波形算出硬币新的位置
  this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

Dest.prototype.act = function (step) {
  return;
}

Bullet.prototype.act = function (step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  var obstacle = level.obstacleAt(newPos, this.size)
  if (!obstacle) {
    this.pos = newPos;
  } else {
    level.bulletTouched(obstacle, this);
  }
}
var playerXSpeed = 7;//设置人物横向移动的速度

Player.prototype.moveX = function (step, level, keys) {
  this.speed.x = 0;
  if (keys.left) {
    this.speed.x -= playerXSpeed;
    this.lastDir = "left";
  }
  if (keys.right) {
    this.speed.x += playerXSpeed;
    this.lastDir = "right";
  }
  var motion = new Vector(this.speed.x * step, 0);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) level.playerTouched(obstacle);//通过playerTouched方法处理玩家被熔岩烧死或收集硬币等事件
  else this.pos = newPos;
};

var gravity = 30;//设置跳跃的重力
var jumpSpeed = 17;//设置跳跃的速度

Player.prototype.moveY = function (step, level, keys) {
  this.speed.y += step * gravity;//通过重力，调整玩家在垂直方向上的速度
  var motion = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) {
    level.playerTouched(obstacle);
    if (keys.up && this.speed.y > 0) this.speed.y = -jumpSpeed;//若障碍物在下方，且已经按过上下键，则让速度减小直至为负数
    else this.speed.y = 0;//停在障碍物上
  } else {
    this.pos = newPos;
  }
};
Player.prototype.shoot = function (step, level, keys) {
  var dir = (this.lastDir == "left" || this.lastDir == null) ? -1 : 1;
  var newPos = this.pos.plus(new Vector(dir * this.size.y, 0));
  if (keys.shoot && level.hasBullet == false) {
    var bullet = new Bullet(newPos, dir);
    level.actors.push(bullet);
    bullet.act(step, level);
    level.hasBullet = true;
  }

}
Player.prototype.act = function (step, level, keys) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);
  var otherActor = level.actorAt(this);
  if (otherActor) level.playerTouched(otherActor.type, otherActor);//判断是否与其他的障碍物有冲突


  this.shoot(step, level, keys);
  // 若游戏失败，使玩家的高度减小模拟下沉，并模拟惯性继续向前移动
  if (level.status == "lost") {
    this.pos.y += step;
    this.size.y -= step;
  }
};


//设置子弹触碰到指定对象后的行为
Level.prototype.bulletTouched = function (type, bullet, actor) {
  if (type == "wall") {
    this.actors = this.actors.filter(function (other) {
      return other != bullet;
    });
  }
}
//玩家设置碰撞到指定元素后的状态
Level.prototype.playerTouched = function (type, actor) {
  if (((type == "river" && this.status == null) || this.hp <= 0)) {//若是碰到河流直接死亡
    this.hp = 0;
    this.showResult();
    this.status = "lost";
    this.finishDelay = 2;
    this.hp = 3;
  } else if (type == "lava" && this.status == null && this.unmatched == false) {//若是岩浆生命值-1并进入短暂的无敌模式
    this.unmatched = true;
    this.hp--;
    this.unmatchedTime = 1;
  } else if (type == "coin") {//若是硬币则加分
    //拾取硬币
    this.actors = this.actors.filter(function (other) {
      return other != actor;
    });
    this.coinCount++;

  } else if (type == "destination") {
    //拾取披风
    this.actors = this.actors.filter(function (other) {
      return other != actor;
    });
    this.showResult();
    this.status = "won";
    this.finishDelay = 2;
  }
};
//==========================================================================













//===========================跟踪按键========================================

/**定义各个按键码的名字 */
var arrowCodes = { 37: "left", 38: "up", 39: "right", 83: "shoot", 75: "up", 65: "left", 68: "right", 74: "shoot" };

/**
 * 跟踪按键
 * @param {对应按键码的数组} codes 
 */
function trackKeys(codes) {
  var pressed = Object.create(null);
  /**
   * 注册"keydown"和"keyup"事件
   * @param {捕获事件} event 
   */

  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      var down = event.type == "keydown";
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}
//==========================================================================


//===========================运行游戏========================================
/**
 * 产生游戏动画
 * @param {对requestAnimationFrame进行封装} frameFunc 
 */
function runAnimation(frameFunc) {
  var lastTime = null;
  /**
   * 绘制图像
   * @param {设置时间间隔} time 
   */
  function frame(time) {
    var stop = false;
    if (lastTime != null) {
      var timeStep = Math.min(time - lastTime, 100) / 1000;//将时间插转化为秒
      stop = frameFunc(timeStep) === false;//判断是否已经结束游戏
    }
    lastTime = time;
    if (!stop) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
/**
 * 初次跟踪按键
 */
var arrows = trackKeys(arrowCodes);

function runLevel(level, passID, unmatched, Display, andThen) {
  var display = new Display(document.body, level);
  if (unmatched) {
    level.unmatched = true;
    level.unmatchedTime = 0x3f3f3f3f3f3f3f;//设置无敌时间为inf
  }
  if (passID == 0) {
    display.statusBar.drawDesc();
  }
  runAnimation(function (step) {
    level.animate(step, arrows);//让平台里面的所有活动元素动起来(step是执行的步长，arrows是按键集合)
    display.drawFrame(step);//更新地图里的信息
    //更新状态栏中的信息
    if (level.status == "won" && passID == 0) {
      display.statusBar.drawBeginGameScene();
    } else if (passID != 0) {
      display.statusBar.showStatus(passID);
    } else {
      display.statusBar.drawDesc();
    }
    if (level.isFinished()) {//若游戏结束，清除平台的所有元素
      display.clear();
      if (andThen) andThen(level.status);//通过andThen来判断是进入下一关还是重新开始
      return false;
    }
  });
}

/**
 * 运行游戏
 * @param {地图} plans 
 * @param {展现的函数} Display 
 * @param {关卡} n
 */
function runGame(plans, Display, n, unmatched) {
  function startLevel(n) {
    runLevel(new Level(plans[n]), n, unmatched, Display, function (status) {
      if (status == "lost") {
        startLevel(n);
      } else if (n == 0) {
        console.log("Begin game!!!!");
        startLevel(1);
      } else if (n < plans.length - 1) startLevel(n + 1);
      else {
        console.log("You Win!!!!");
      }
    });
  }
  startLevel(n);
}



