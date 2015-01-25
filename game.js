/*
 * Pinpon dash.JS
 * Global Game Jum 2015 in Tokyo chika-ba
 */

Pinpon_dash = {}; // ピンポンダッシュオブジェクト
Pinpon_dash.fase = {}; // 行動フェーズに関するオブジェクト
Pinpon_dash.timer = {}; // ゲームのタイマー関連オブジェクト
Pinpon_dash.audio = {}; // オーディオオブジェクト
Pinpon_dash.userData = {}; // ユーザーの操作によって扱われるデータ


// 1ループの秒数。これが徐々に減っていく (lasts 4 floors = 16 doors)
Pinpon_dash.timer.loop_of_msec = 2000;
// 現在の経過秒数
Pinpon_dash.timer.now_msec = 0;
// 繰り返した回数(スコア)
Pinpon_dash.userData.score = 0;
Pinpon_dash.userData.score2 = 0;
// ノックするターンとドアを開くターンを切り替える。正の数の時はノック、負の数の時はオープン
Pinpon_dash.fase.knock_or_open_flag = 1;
// タイマーの間隔。値を少なくするとフレームレイトが上昇
Pinpon_dash.timer.default_timer_wait = 20;


// 初期化
Pinpon_dash.init = function() {
	// ユーザーがノックした時間
	// this.userData.knocked_times = new Array();
	// doors knocked by player 1, by number
	this.userData.knocked_doors = new Array();
	// ユーザーがオープンした時間
	// this.userData.opened_times = new Array();
	// doors opened by player 2, by number
	this.userData.opened_doors = new Array();

	// loading sounds.
	Pinpon_dash.load_sounds();

	// reference game div
	this.main_div = document.getElementById('pinpon_dash');

	// reference sprites
	this.character1 = document.getElementById('player1-icon-area');
	this.character2 = document.getElementById('player2-icon-area');

	// door sprites
	this.door_sprites = new Array(16);
	for (var i = this.door_sprites.length - 1; i >= 0; i--) {
		this.door_sprites[i] = document.getElementById("door" + (i +1));
	};

	// knock sprites
	this.knock_effects = new Array();

	// set initial character
	this.current_character = this.character1
}

// スタート処理
Pinpon_dash.start = function() {
	// スタートボタンを無効にする
	document.getElementById("game-start-button").disabled = true;
	// 開始前の合図
	this.first_starting_process();
}

// ゲーム開始1。チャイム音を鳴らす
Pinpon_dash.first_starting_process = function() {
	// 待機サウンドを停止
	this.audio.start_wait.pause();
	// チャイム音を鳴らす
	this.audio.startSE.play();
	setTimeout("Pinpon_dash.second_starting_process();", this.timer.loop_of_msec);
}

// ゲーム開始2。ボイスを鳴らす
Pinpon_dash.second_starting_process = function() {
	// ボイスを鳴らす
	this.audio.ready.play();
	setTimeout("Pinpon_dash.thard_starting_process();", this.timer.loop_of_msec);
	document.getElementById("user-action-button").disabled = false;
	document.getElementById("user-action-button").focus(0);
}

// ゲーム開始3。ノックフェーズ開始
Pinpon_dash.thard_starting_process = function() {
	// Play music
	this.audio.bgm.play();
	// FIXME: prefer reseting the array than creating a new object
	// this.userData.knocked_times = new Array();
	this.userData.knocked_doors = new Array();

	// timer start
	this.timer.intervalID = setInterval("Pinpon_dash.process_of_phase();", this.timer.default_timer_wait);
}


// 音声をロード
Pinpon_dash.load_sounds = function() {
	// 待機中に流す音楽
	this.audio.start_wait = new Audio("bgm/bgm_startWait.mp3");
	this.audio.start_wait.loop = true;
	this.audio.start_wait.play();
	this.audio.miss = new Audio("wav/miss.mp3");

	// ゲーム開始時に鳴らす効果音
	this.audio.startSE = new Audio("wav/startSE.mp3");
	this.audio.ready = new Audio("wav/ready.mp3");

	// メインのBGM
	this.audio.bgm = new Audio("bgm/bgm_bpm120.mp3");

	// 各種効果音
	this.audio.change_phase = new Audio("wav/change_fase.mp3"); // フェーズ変更時の音(デバッグ用)
	this.audio.knock = [ // ドアノック音
		new Audio("wav/knock1.mp3"),
		new Audio("wav/knock2.mp3"),
	]; //ドアノック音
	this.audio.open = [ // ドアオープン音
		new Audio("wav/doorOpen1.mp3"),
		new Audio("wav/doorOpen2.mp3")
	] // ドアオープン音
}

// プレイヤーの行動フェーズを進める
Pinpon_dash.process_of_phase = function() {
	this.timer.now_msec += this.timer.default_timer_wait;
	if(this.timer.loop_of_msec < this.timer.now_msec) { // ループ秒に達したら？
		this.change_phase(); // フェーズ変更
	} // end if msec end.

	// VIEW Character
	Pinpon_dash.render_character()
}

// 時刻情報から扉の番号を返す(1-16)
Pinpon_dash.getDoorNumber_from_nowTime = function() {
	var ret = Math.floor(this.timer.now_msec / (this.timer.loop_of_msec / 16.0) + 1);
	if(ret > 16) ret = 16;
	return(ret);
}

// プレイヤーの位置を、扉画像の位置に調整する
Pinpon_dash.set_player_position = function() {
	var doorNumber = this.getDoorNumber_from_nowTime();
	var time_per_floor = this.timer.loop_of_msec / 4;

	var img = document.getElementById("door" + doorNumber);

	var left_offset = -5 + 1024 / 2 * (this.timer.now_msec - Math.floor((doorNumber - 1) / 4) * time_per_floor) / time_per_floor;
	this.current_character.style.cssText = "top:" + (img.offsetParent.offsetTop + 96) + "px; left:" + left_offset + "px; position: absolute;";
}

// アクションするフェーズの変更
Pinpon_dash.change_phase = function() {
	// 切り替わったことを音で鳴らしている(デバッグ用)
	this.audio.change_phase.play();

	// hide last character
	this.current_character.style.visibility = "hidden"

	if(this.fase.knock_or_open_flag == 1) { // ノックフェーズからオープンフェーズへ移行
		this.change_knock_to_open_fase();
	} else { // オープンフェーズからノックフェーズへ移行
		this.change_open_to_knock_fase();
	} // フェーズ変更

	// ループ用の時刻情報を初期化して、次フェーズへ移せるようにする
	Pinpon_dash.timer.now_msec = 0; // 初期化
	// ノック、オープンのフラグを切り替え
	this.fase.knock_or_open_flag *= -1;
}

// ユーザーがボタンを押したことで呼ばれる関数
Pinpon_dash.on_click = function() {
	knock_number = this.getDoorNumber_from_nowTime();
	if(this.fase.knock_or_open_flag == 1) { // ノックする
		this.knock_door(knock_number);
	} else { // ドアを開ける
		this.open_door();
	} // ノックするかドアを開けるか？
}

// 音声のリスタート
Pinpon_dash.audio.replay = function(audio_object) {
	audio_object.pause();
	audio_object.currentTime = 0;
	audio_object.play();
}

// ドアをノックする処理
Pinpon_dash.knock_door = function(knock_number) {
	// 現在のノック時刻を格納
	// TODO: register door instead of time, and delay SFX and GFX
	// this.userData.knocked_times.push(Pinpon_dash.timer.now_msec);
	this.userData.knocked_doors.push(knock_number);
	// ドアをノックしたエフェクト
	this.effect_knock_door(knock_number);
}

// ドアをノックした時のエフェクト
Pinpon_dash.effect_knock_door = function(knock_number) {
	// ノックした音を再生
	this.audio.replay(this.audio.knock[Math.round(Math.random())]);
	// knock GFX
	knock_effect_index = this.get_or_create_knock_effect_index();
	knock_effect = this.knock_effects[knock_effect_index];
	// knock_effect.style.visibility = "visible";
	knock_effect.style.cssText = "visibility: visible; top:" + (this.door_sprites[knock_number - 1].offsetParent.offsetTop + 50) + "px; left:" + (this.door_sprites[knock_number - 1].offsetParent.offsetLeft + 50) + "px; position: absolute;";
	setTimeout("Pinpon_dash.hide_knock_effect(" + knock_effect_index + ")", 1000);
}

// ドアを開ける処理
Pinpon_dash.open_door = function() {
	// register number of opened door
	var doorNumber = this.getDoorNumber_from_nowTime();
	this.userData.opened_doors.push(doorNumber);

	// 開けるドアを取得して、画像リソースを差し替える
	var img = document.getElementById("door" + doorNumber);
	img.src = "img/opened_door.png";

	if (this.userData.knocked_doors.indexOf(doorNumber) > -1) {
		this.effect_open_knocked_door(); // 正しいタイミングでドアが開く
		return; // ドアが開いたのでここで処理終了
	}

	// // ノックした時刻をチェック
	// for(var i = 0; i < this.userData.knocked_times.length; i ++) {
	// 	// ノックとのタイミングを比較して、前後の扉との時間内に収まっていればOK。
	// 	if(Math.abs(this.userData.knocked_times[i] - this.timer.now_msec) < (this.timer.loop_of_msec / 16)) { // ノックしたドアなのでOK
	// 		this.effect_open_knocked_door(); // 正しいタイミングでドアが開く
	// 		return; // ドアが開いたのでここで処理終了
	// 	} // 正しいドアが開けたか？
	// } // end for.

	// ノックしていないドアを開いたので雷おじさん降臨
	this.effect_open_non_knocked_door();
}

// ドアを開ける時のエフェクト
Pinpon_dash.effect_open_knocked_door = function() {
	// ドアを開いた音を再生
	this.audio.replay(this.audio.open[Math.round(Math.random())]);
}

// ノックしていないドアを開ける時のエフェクト
Pinpon_dash.effect_open_non_knocked_door = function() {
	this.audio.miss.play();
	return(true);

	// 音楽を止める
	this.audio.bgm.pause();
	// ドアを開いた音を再生
	this.audio.replay(this.audio.open[Math.round(Math.random())]);
	// ゲームオーバーが確定したのでタイマー処理を中断
	clearInterval(this.timer.intervalID);
	// ドアが開いた音が終わるのを待ってから、ゲームオーバーページへ移動
	setTimeout('window.location.href = "./gameover1.htm#score' + this.userData.score + '_' + this.userData.score2 + '"', 800);
}

// ノックフェーズからオープンフェーズへの移行
Pinpon_dash.change_knock_to_open_fase = function() {

	// change current character
	this.current_character = this.character2;

	// 「ノック」ボタンを「ドアを開ける」ボタンに書き換える
	document.getElementById("user-action-button").value = "あける";
}

// オープンフェーズからノックフェーズへの移行
Pinpon_dash.change_open_to_knock_fase = function() {
	this.check_is_non_open_door(); // 未開封のドアのチェック
	// this.userData.score2 += this.userData.opened_times.length;
	this.userData.score2 += this.userData.opened_doors.length;

	// 押したノック、オープンボタンの情報を初期化
	// this.userData.knocked_times = new Array();
	// this.userData.opened_times = new Array();
	this.userData.knocked_doors = new Array();
	this.userData.opened_doors = new Array();

	// 開いたドアを閉める
	var imgs = document.getElementsByClassName("door");
	for(var i = 0; i < imgs.length; i ++) {
		imgs[i].src = "img/closed_door.png";
	} // end for.

	// change current character
	this.current_character = this.character1;

	document.getElementById("user-action-button").value = "[ノック]";
	// 1小説経過したのでスコアを増やす
	this.userData.score ++;
	// 4小説経過毎にレベルアップ
	if(this.userData.score % 4 == 0) this.level_up();
}

// ゲームのレベルがアップ
Pinpon_dash.level_up = function() {
	var bpm = Math.round(this.userData.score * 1.25) + 120;
	this.audio.bgm = new Audio("bgm/bgm_bpm" + bpm + ".mp3");
	this.timer.loop_of_msec = 120 * 2000.0 / bpm;
	this.audio.bgm.play();
}

// 未開放のドアのチェック
Pinpon_dash.check_is_non_open_door = function() {
	// for(var i = 0; i < this.userData.knocked_times.length; i ++) {
	// 	// 開け忘れのドア
	// 	if(!(this.userData.opened_times[i]) || Math.abs(this.userData.knocked_times[i] - this.userData.opened_times[i]) > (this.timer.loop_of_msec / 16)) {
	// 		this.effect_unopen_door(i); // 開いてないドアの処理
	// 	}
	// } // end for.

	// check if player 2 missed a door (sub-optimal, prefer a sorted comparison)
	for(var i = 0; i < this.userData.knocked_doors.length; i ++) {
		if (this.userData.opened_doors.indexOf(this.userData.knocked_doors[i]) == -1) {
			this.effect_unopen_door(i); // 開いてないドアの処理
		}
	}
}

// 開いていないドアがあった時のエフェクト
Pinpon_dash.effect_unopen_door = function() {
	Pinpon_dash.audio.bgm.pause();
	window.location.href = ("./gameover2.htm#score" + this.userData.score + "_" + this.userData.score2);
}

// Render current character
Pinpon_dash.render_character = function() {
	this.current_character.style.visibility = "visible";
	// プレイヤーが立つ位置を設定
	this.set_player_position();
}

// Look for an unused knock_effect and create one, push it on the list and return it if could not find any
// Return the knock effect by index
Pinpon_dash.get_or_create_knock_effect_index = function() {
	for (var i = this.knock_effects.length - 1; i >= 0; i--) {
		if (this.knock_effects[i].style.visibility === "hidden") {
			return i;
		}
	};

	// no unused knock_effect was found; create one
	knock_effect = new Image()
	// knock_effect = document.createElement("img")
	knock_effect.src = "img/don.png"
	// TODO: resize image
	// knock_effect.style.visibility = "visible";

	// add the knock effect to the game's div and push it on the list of effects
	this.main_div.appendChild(knock_effect)
	this.knock_effects.push(knock_effect)

	return this.knock_effects.length - 1
}

// Hide the knock effect with the given index
Pinpon_dash.hide_knock_effect = function(knock_effect_number) {
	this.knock_effects[knock_effect_number].style.visibility = "hidden";
}

window.onload = function() {
	Pinpon_dash.init();

	// ノックボタンを有効にし、フォーカスを移す
	document.getElementById("user-action-button").disabled = true;
	document.getElementById("game-start-button").disabled = false;
	document.getElementById("game-start-button").focus(0);
}
