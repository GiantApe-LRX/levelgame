//'@':玩家
//'o':硬币
//'=':水平方向移动的熔岩
//'|':垂直方向移动的熔岩
//'v':表示下落的元素
//tip:所有元素位置对应的网格设置为空气
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
  this.grid = []; //存储非活动的元素，活动元素设为null
  this.actors = []; //存储活动元素

  for (var y = 0; y < this.height; y++) {
    var line = plan[y],
      gridLine = [];
    for (var x = 0; x < this.width; x++) {
      var ch = line[x],
        fieldType = null; //ch:表示地图中的各个元素对应的字符，fieldType表示方块的类型
      var Actor = actorChars[ch]; //将字符映射为指定的活动元素对象
      if (Actor)
        //若为活动元素，如玩家，硬币，岩浆。
        this.actors.push(new Actor(new Vector(x, y), ch));
      else if (ch == "x") fieldType = "wall";
      else if (ch == "!") fieldType = "lava";
      else if (ch == "r") fieldType = "river";
      else if (ch == "d") fieldType = "door";
      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }

  //判断是否存在player玩家
  this.player = this.actors.filter(function (actor) {
    return actor.type == "player";
  })[0];

  //status:记录玩家的胜负
  //finishDelay:结束关卡的延迟
  this.status = this.finishDelay = null;
}

/**
 * 用于判断关卡是否结束
 */
Level.prototype.isFinished = function () {
  return this.status != null && this.finishDelay < 0;
};

/**
 * 构造坐标对象
 * @param {横坐标} x
 * @param {纵坐标} y
 */
function Vector(x, y) {
  this.x = x;
  this.y = y;
}
//用于加减指定元素的坐标
Vector.prototype.plus = function (other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
//通过factor来缩放向量，在移动元素时可以计算速度向量与时间间隔的乘机
Vector.prototype.times = function (factor) {
  return new Vector(this.x * factor, this.y * factor);
};

var actorChars = {
  "@": Player,
  "o": Coin,
  "=": Lava,
  "|": Lava,
  "v": Lava,
};

/**
 * 构造玩家对象
 * @param {指定玩家的位置，玩家出现为'@'c出现的高度的二分之一} pos
 * size属性设置玩家的高和长
 * speed属性用于存储当前速度，用于模拟动量或重力 
 */

function Player(pos) {
  this.pos = pos.plus(new Vector(0, -0.5));
  this.size = new Vector(0.8, 1.5);
  this.speed = new Vector(0, 0);
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
 * 构造河流对象
 * @param {指定河流的位置}} pos 
 */
function River(pos) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  this.speed = new Vector(0, 0);
}
River.prototype.type = "river";

function Door(pos) {
  this.pos = pos;
  this.size = new Vector(1, 1);
}
Door.prototype.type = "door";
/**
 * 构造硬币对象
 * @param {指定硬币的基准位置} pos
 * size属性表示硬币的大小
 * wobble属性表示硬币跟踪图像跳动幅度 
 */
function Coin(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2;
}
Coin.prototype.type = "coin";

//测试地图创建正常
// var simpleLevel = new Level(simpleLevelPlan);
// console.log(simpleLevel.height, simpleLevel.width);
// console.log(simpleLevel);

/**
 * 创建DOM元素对象
 * @param {指定的DOM元素名} name 
 * @param {指定的DOM元素的className} className 
 */
function elt(name, className) {
  var elt = document.createElement(name);
  if (className) elt.className = className;
  return elt;
}

/**
 * 构造监视器对象
 * @param {指定父类对象的监视器} parent 
 * @param {传入指定的地图} level 
 */
function DOMDisplay(parent, level) {
  this.wrap = parent.appendChild(elt("div", "game"));//游戏的包装器
  this.level = level;

  this.wrap.appendChild(this.drawBackground());
  this.actorLayer = null;//保存活动元素的动作
  this.drawFrame();//绘制活动元素
}

var scale = 20;//实际方格的高

/**
 * 绘制关卡背景
 */
DOMDisplay.prototype.drawBackground = function () {
  var table = elt("table", "background");
  table.style.width = this.level.width * scale + "px";
  this.level.grid.forEach(function (row) {
    var rowElt = table.appendChild(elt("tr"));
    rowElt.style.height = scale + "px";
    row.forEach(function (type) {
      rowElt.appendChild(elt("td", type));
    });
  });
  return table;
};

/**
 * 绘制活动元素
 */
DOMDisplay.prototype.drawActors = function () {
  var wrap = elt("div");//用于包装活动元素的包装器
  this.level.actors.forEach(function (actor) {//设置每一个活动元素的长高以及位置
    var rect = wrap.appendChild(elt("div", "actor " + actor.type));
    rect.style.width = actor.size.x * scale + "px";
    rect.style.height = actor.size.y * scale + "px";
    rect.style.left = actor.pos.x * scale + "px";
    rect.style.top = actor.pos.y * scale + "px";
  });
  return wrap;
};

DOMDisplay.prototype.drawFrame = function () {//需要被实时的调用，更新地图的显示
  if (this.actorLayer) this.wrap.removeChild(this.actorLayer);//删除所有的旧活动元素
  this.actorLayer = this.wrap.appendChild(this.drawActors());
  this.wrap.className = "game " + (this.level.status || "");
  this.scrollPlayerIntoView();
};

/**
 * 调整窗口的视图
 */
DOMDisplay.prototype.scrollPlayerIntoView = function () {
  var width = this.wrap.clientWidth;//获取wrap的可视宽度
  var height = this.wrap.clientHeight;//获取wrap的可视高度
  var margin = width / 3;

  // The viewport
  var left = this.wrap.scrollLeft,//设置或获取位于wrap左边界和窗口中目前可见内容的最左端之间的距离
    right = left + width;
  var top = this.wrap.scrollTop,//获取wrap对象的滚动高度
    bottom = top + height;

  var player = this.level.player;
  var center = player.pos.plus(player.size.times(0.5)).times(scale);//获取人物的中心坐标

  if (center.x < left + margin) this.wrap.scrollLeft = center.x - margin;//视图左移
  else if (center.x > right - margin)
    this.wrap.scrollLeft = center.x + margin - width;                   //视图右移
  if (center.y < top + margin) this.wrap.scrollTop = center.y - margin; //视图上移
  else if (center.y > bottom - margin)
    this.wrap.scrollTop = center.y + margin - height;                   //视图下移
};

/**
 * 清除关卡中所有的元素，在重新关卡或进入下一个关卡时调用此方法
 */
DOMDisplay.prototype.clear = function () {
  this.wrap.parentNode.removeChild(this.wrap);
};


/**
 * 返回指定位置的元素类型
 */
Level.prototype.obstacleAt = function (pos, size) {
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  if (xStart < 0 || xEnd > this.width || yStart < 0) return "wall";//若是到了左右边界则当作墙处理
  if (yEnd > this.height) return "lava";//若是到了底部则当作岩浆处理
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var fieldType = this.grid[y][x];
      if (fieldType) return fieldType;
    }
  }
};


/**
 * 找到与actor有碰撞的物体并返回
 */
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

var maxStep = 0.05;//每次的移动不能超过0.05s


Level.prototype.animate = function (step, keys) {
  if (this.status != null) this.finishDelay -= step;//调整关卡结束之后，继续进入下一关或者重新开始的时间

  while (step > 0) {//为了使得动画连贯，将移动的距离进行分割，每次都要小于0.05
    var thisStep = Math.min(step, maxStep);
    this.actors.forEach(function (actor) {
      actor.act(thisStep, this, keys);
    }, this);
    step -= thisStep;
  }
};

/**
 * 设置岩浆的移动属性，因为它不需要键盘输入，所以不需要keys参数
 */
Lava.prototype.act = function (step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if (!level.obstacleAt(newPos, this.size)) this.pos = newPos;
  else if (this.repeatPos) this.pos = this.repeatPos;//若是垂直下落的熔岩，则触碰到障碍物就回到初始的位置
  else this.speed = this.speed.times(-1);//其他的熔岩则向相反的方向移动
};
River.prototype.act = function (step) {
  var newPos = this.pos.plus(this.speed.times(step));
  this.pos = newPos;
}
var wobbleSpeed = 8,
  wobbleDist = 0.07;

/**
 * 设置硬币的晃动
 */
Coin.prototype.act = function (step) {
  this.wobble += step * wobbleSpeed;//跟踪时间以创建波长
  var wobblePos = Math.sin(this.wobble) * wobbleDist;//以波形算出硬币新的位置
  this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

var playerXSpeed = 7;//设置人物横向移动的速度

/**
 * 设置玩家的水平移动，若触碰到墙壁，玩家停止下落或跳跃动作，若触碰到了地面，玩家停止左右移动
 */
Player.prototype.moveX = function (step, level, keys) {
  this.speed.x = 0;
  if (keys.left) this.speed.x -= playerXSpeed;
  if (keys.right) this.speed.x += playerXSpeed;

  var motion = new Vector(this.speed.x * step, 0);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) level.playerTouched(obstacle);//通过playerTouched方法处理玩家被熔岩烧死或收集硬币等事件
  else this.pos = newPos;
};

var gravity = 30;//设置跳跃的重力
var jumpSpeed = 17;//设置跳跃的速度

/**
 * 设置玩家的跳跃动作
 */
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

Player.prototype.act = function (step, level, keys) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);

  var otherActor = level.actorAt(this);
  if (otherActor) level.playerTouched(otherActor.type, otherActor);//判断是否与其他的障碍物有冲突
  // Losing animation
  /**
   * 若游戏失败，使玩家的高度减小模拟下沉，并模拟惯性继续向前移动
   */
  if (level.status == "lost") {
    this.pos.y += step;
    this.size.y -= step;
  }
};

/**
 * 设置碰撞到指定元素后的状态
 */
Level.prototype.playerTouched = function (type, actor) {
  if ((type == "lava" || type == "river") && this.status == null) {//若是岩浆直接失败
    this.status = "lost";
    this.finishDelay = 3;
  } else if (type == "coin") {//若是硬币则加分
    this.actors = this.actors.filter(function (other) {
      return other != actor;
    });
    if (
      !this.actors.some(function (actor) {
        return actor.type == "coin";
      })      //如果元素中没有硬币了，则玩家胜
    ) {
      this.status = "won";
      this.finishDelay = 3;
    }
  }
};

/**定义各个按键码的名字 */
var arrowCodes = { 37: "left", 38: "up", 39: "right" };

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

function runLevel(level, Display, andThen) {
  var display = new Display(document.body, level);
  runAnimation(function (step) {
    level.animate(step, arrows);//让平台里面的所有活动元素动起来(step是执行的步长，arrows是按键集合)
    display.drawFrame(step);//更新地图里的信息
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
 */
function runGame(plans, Display) {
  /**
   * 设置游戏开始的关卡
   * @param {关卡序号} n 
   */
  function startLevel(n) {
    runLevel(new Level(plans[n]), Display, function (status) {
      if (status == "lost") startLevel(n);
      else if (n < plans.length - 1) startLevel(n + 1);
      else console.log("You win!");
    });
  }
  startLevel(0);
}
function runGame(plans, Display) {
  /**
   * 设置游戏开始的关卡
   * @param {关卡序号} n 
   */
  function startLevel(n) {
    runLevel(new Level(plans[n]), Display, function (status) {
      if (status == "lost") startLevel(n);
      else if (n < plans.length - 1) startLevel(n + 1);
      else console.log("You win!");
    });
  }
  startLevel(0);
}
function runGame(plans, Display, n) {
  /**
   * 设置游戏开始的关卡
   * @param {关卡序号} n 
   */
  function startLevel(n) {
    runLevel(new Level(plans[n]), Display, function (status) {
      if (status == "lost") startLevel(n);
      else if (n == 0) {
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


