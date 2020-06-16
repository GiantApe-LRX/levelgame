function StatusBar(parent, level) {
    this.wrap = parent.appendChild(elt("div", "statusBar"));
    this.wrap.style.height = ((level.height * scale > 450) ? 450 : level.height * scale) + "px";
    this.level = level;
}

StatusBar.prototype.clear = function () {
    this.wrap.innerHTML = "";
}

StatusBar.prototype.drawDesc = function () {
    this.clear();
    var descDiv = this.wrap.appendChild(elt("div", "descDiv"));
    descDiv.innerText = "游戏说明";

    var tableDiv = this.wrap.appendChild(elt("div", "tableDiv"));
    var table = elt("table", "descTable");
    //操作说明：
    var trAltDesc = table.appendChild(elt("tr"));
    var tdAltDescLabel = trAltDesc.appendChild(elt("td", "label"));
    var tdAltDesc = trAltDesc.appendChild(elt("td", "content"));
    tdAltDescLabel.innerText = "操作说明:";
    tdAltDesc.innerHTML = "↑或k：跳跃<br>←或a：人物左移<br>→或d：人物右移<br>s或j：射击子弹";
    //游戏目标：
    var trGameDesc = table.appendChild(elt("tr"));
    var tdGameDescLabel = trGameDesc.appendChild(elt("td", "label"));
    var tdGameDesc = trGameDesc.appendChild(elt("td", "content"));
    tdGameDescLabel.innerText = "游戏目标:";
    tdGameDesc.innerHTML = "合理操作，得到披风，顺利闯关";
    //其他说明:
    var trOtherDesc = table.appendChild(elt("tr"));
    var tdOtherDescLabel = trOtherDesc.appendChild(elt("td", "label"));
    var tdOtherDesc = trOtherDesc.appendChild(elt("td", "content"));
    tdOtherDescLabel.innerText = "其他说明:";
    tdOtherDesc.innerHTML = "1.玩家一开始有三格血量，能量若为0则游戏结束<br><br>2.若玩家触碰到了熔岩则减少一点血量<br><br>3.若玩家掉到水下或掉出地图则血量减少至0<br><br>";
    tableDiv.appendChild(table);
}
/**
 * 显示通过第一关的提示信息
 */
StatusBar.prototype.drawBeginGameScene = function () {
    this.clear();
    var tipDiv = this.wrap.appendChild(elt("div", "tipDiv"));
    tipDiv.innerHTML = "即将开始游戏，请耐心等候..."
}

/**
 * 展示结束游戏时的提示信息
 */
StatusBar.prototype.drawFinishScene = function () {
    this.clear();

}

/**
 * 展示当前的状态(当前剩余血量，总金币数，总耗时，当前状态)
 */
StatusBar.prototype.showStatus = function (passID) {
    this.clear();
    var passInfoDiv = this.wrap.appendChild(elt("div", "passInfoDiv"));
    passInfoDiv.innerText = "第" + passID + "关";
    var tableDiv = this.wrap.appendChild(elt("div", "tableDIV"));
    var statusTable = tableDiv.appendChild(elt("table", "statusTabel"));

    /**
     * 获取剩余血量
     */
    var trHP = statusTable.appendChild(elt("tr"));
    var tdHPLabel = trHP.appendChild(elt("td", "statusLabel"));
    tdHPLabel.innerText = "血量：";
    var tdHPContent = trHP.appendChild(elt("td"));
    for (var i = 0; i < this.level.hp; i++) {
        tdHPContent.innerText += "❤";
    }

    /**
     * 获取当前击败的怪物数量
     */
    var trBeatEnemyCount = statusTable.appendChild(elt("tr"));
    var tdBeatEnemyCountLabel = trBeatEnemyCount.appendChild(elt("td", "statusLabel"));
    tdBeatEnemyCountLabel.innerText = "当前击败的怪物数为：";
    var tdBeatEnemyCountContent = trBeatEnemyCount.appendChild(elt("td"));
    tdBeatEnemyCountContent.innerText = this.level.beatEnemyCount;
    /**
     * 获取当前总金币数
     */
    var trCoinCount = statusTable.appendChild(elt("tr"));
    var tdCoinCountLable = trCoinCount.appendChild(elt("td", "statusLable"));
    tdCoinCountLable.innerText = "总金币数："
    var tdCoinContent = trCoinCount.appendChild(elt("td"));
    tdCoinContent.innerText = this.level.coinCount;

    /**
     * 获取当前状态以及无敌状态可持续的剩余时间
     */
    var trUnmatched = statusTable.appendChild(elt("tr"));
    var tdUnmatchedLabel = trUnmatched.appendChild(elt("td", "statusLable"));
    tdUnmatchedLabel.innerText = "当前状态："
    var tdUnmatchedContent = trUnmatched.appendChild(elt("td"));
    tdUnmatchedContent.innerHTML = (this.level.unmatched == true ? "无敌模式<br>(剩余" + (this.level.getUnmatchedTime() < 3 ? this.level.getUnmatchedTime() + "s" : "inf") + ")" : "普通模式");

    /**
     * 获取当前耗时
     */
    var trGetTime = statusTable.appendChild(elt("tr"));
    var tdGetTimeLabel = trGetTime.appendChild(elt("td", "statusLabel"));
    tdGetTimeLabel.innerHTML = "当前耗时：";
    var tdGetTime = trGetTime.appendChild(elt("td"));
    tdGetTime.innerText = this.level.getGameTime();

    /**
     * 当玩家失败时的提示信息
     */
    var tipDiv = this.wrap.appendChild(elt("div", "tipDiv"));
    if (this.level.status == "won") {
        tipDiv.innerHTML = "恭喜通关,即将进入下一关！<br>请等待...";
    } else if (this.level.status == "lost") {
        tipDiv.innerHTML = "不要气馁,可以重新来过！<br>请等待...";
    }
}